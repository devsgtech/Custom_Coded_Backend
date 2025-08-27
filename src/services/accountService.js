const pool = require("../config/database");
const response = require("../utils/response");
const authService = require("./authService");
const bcryptjs = require("bcryptjs");

const accountService = {
  fetchAdminUsers: async (currentPage, itemsPerPage, filters, search) => {
    try {
      let whereClause = " WHERE 1=1";
      const params = [];

      if (filters && Array.isArray(filters)) {
        filters.forEach((filter) => {
          if (
            filter.field === "role" &&
            Array.isArray(filter.value) &&
            filter.value.length > 0
          ) {
            const placeholders = filter.value.map(() => "?").join(",");
            whereClause += ` AND role IN (${placeholders})`;
            params.push(...filter.value);
          }
        });
      }

      if (search) {
        whereClause += ` AND (name LIKE ? OR email LIKE ?)`;
        const searchKeyword = `%${search}%`;
        params.push(searchKeyword, searchKeyword);
      }

      const countQuery = `SELECT COUNT(*) as totalItems FROM tbl_admin_users${whereClause}`;
      const [countRows] = await pool.execute(countQuery, params);
      const totalItems = countRows[0].totalItems;

      let limitClause = "";
      let page = 1;
      let totalPages = 1;

      // Only apply pagination if both currentPage and itemsPerPage are provided
      if (currentPage && itemsPerPage) {
        const limit = parseInt(itemsPerPage, 10);
        page = parseInt(currentPage, 10);
        totalPages = Math.ceil(totalItems / limit) || 1;

        if (page > totalPages) page = 1;

        const offset = (page - 1) * limit;
        limitClause = ` LIMIT ${limit} OFFSET ${offset}`;
      }

      const dataQuery = `SELECT * FROM tbl_admin_users${whereClause} ORDER BY created_on DESC${limitClause}`;
      const [adminUsers] = await pool.execute(dataQuery, params);

      return { adminUsers, totalItems, totalPages, currentPage: page };
    } catch (error) {}
  },

  createAdminUsers: async (name, email, password, role, security_questions) => {
    try {
      const [existingUser] = await pool.execute(
        "SELECT * FROM tbl_admin_users WHERE email = ?",
        [email]
      );

      if (existingUser.length > 0) {
        return response.validationError(res, "Email already exists");
      }

      const hashedPassword = await bcryptjs.hash(
        password,
        10
      );

      const [result] = await pool.execute(
        "INSERT INTO tbl_admin_users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role]
      );

      const adminId = result.insertId;

      for (const sq of security_questions) {
        const hashedAnswer = await bcryptjs.hash(
          sq.answer,
          10
        );
        await pool.execute(
          "INSERT INTO tbl_security_question_ans_mapping (admin_user_id, question_id, answer) VALUES (?, ?, ?)",
          [adminId, sq.question_id, hashedAnswer]
        );
      }
      return { data: { admin_id: adminId }, status: true };
    } catch (error) {
      console.error("Failed to create new user", error);
      throw new Error("Failed to create new user");
    }
  },

  // Verify admin token
  verifyAdminToken: async (adminId, token) => {
    return authService.verifyAdminToken(adminId, token);
  },

  // Update admin user
  updateAdminUser: async (adminId, updatedData) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { security_questions, ...adminData } = updatedData;

      delete adminData.admin_id;
      console.log("adminData..........", adminData);

      if (Object.keys(adminData).length > 0) {
        if (adminData.password) {
          adminData.password = await bcryptjs.hash(
            adminData.password,
            10
          );
        }
        const fields = Object.keys(adminData)
          .map((key) => `${key} = ?`)
          .join(", ");
        const values = [...Object.values(adminData), adminId];
        const query = `UPDATE tbl_admin_users SET ${fields} WHERE admin_id = ?`;
        await connection.execute(query, values);
      }

      if (security_questions && Array.isArray(security_questions)) {
        for (const sq of security_questions) {
          const { question_id, answer } = sq;
          const hashedAnswer = await bcryptjs.hash(answer, 10);
          // Check if the mapping already exists
          const [rows] = await connection.execute(
            "SELECT * FROM tbl_security_question_ans_mapping WHERE admin_user_id = ? AND question_id = ?",
            [adminId, question_id]
          );

          if (rows.length > 0) {
            // Update existing answer
            await connection.execute(
              "UPDATE tbl_security_question_ans_mapping SET answer = ? WHERE admin_user_id = ? AND question_id = ?",
              [hashedAnswer, adminId, question_id]
            );
          } else {
            // Insert new answer
            await connection.execute(
              "INSERT INTO tbl_security_question_ans_mapping (admin_user_id, question_id, answer) VALUES (?, ?, ?)",
              [adminId, question_id, hashedAnswer]
            );
          }
        }
      }

      await connection.commit();
      return { message: "Admin user updated successfully." };
    } catch (error) {
      await connection.rollback();
      console.error("Error updating admin user:", {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
      });
      throw new Error(`Failed to update admin user: ${error.message}`);
    } finally {
      connection.release();
    }
  },

  fetchSecurityQuestions: async () => {
    try {
      const [rows] = await pool.execute("SELECT * FROM tbl_security_questions");
      return rows;
    } catch (error) {
      console.error("Failed to fetch security questions", error);
      throw new Error("Failed to fetch security questions");
    }
  },
};

module.exports = accountService;