const pool = require("../config/database");
const authService = require("./authService");

const contactService = {
  // Create contact submission
  createContact: async (contactData) => {
    try {
      const {
        contact_name,
        contact_email,
        contact_greeting,
        contact_ip,
        contact_country,
        contact_captcha_token,
      } = contactData;

      const query = `
                INSERT INTO tbl_contact_us 
                (contact_name, contact_email, contact_greeting, created_on, contact_ip, contact_country, contact_captcha_token) 
                VALUES (?, ?, ?, NOW(), ?, ?, ?)
            `;

      const [result] = await pool.execute(query, [
        contact_name,
        contact_email,
        contact_greeting,
        contact_ip,
        contact_country,
        contact_captcha_token,
      ]);

      return result.insertId;
    } catch (error) {
      console.error("Error creating contact submission:", error);
      throw new Error("Failed to submit contact form");
    }
  },

  // Get all contact messages
  getAllMessages: async (
    currentPage,
    itemsPerPage,
    filters = [],
    search = ""
  ) => {
    try {
      let whereClause = " WHERE 1=1";
      const params = [];

      if (filters && Array.isArray(filters)) {
        filters.forEach((filter) => {
          if (filter.field === "status" && filter.value) {
            // Handle both single value and array of values for status
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              const placeholders = filter.value.map(() => "?").join(",");
              whereClause += ` AND status IN (${placeholders})`;
              params.push(...filter.value);
            } else if (typeof filter.value === 'string') {
              whereClause += " AND status = ?";
              params.push(filter.value);
            }
          }
        });
      }

      if (search) {
        whereClause +=
          " AND (contact_name LIKE ? OR contact_email LIKE ? OR contact_greeting LIKE ?)";
        const searchKeyword = `%${search}%`;
        params.push(searchKeyword, searchKeyword, searchKeyword);
      }

      const countQuery = `SELECT COUNT(*) as totalItems FROM tbl_contact_us${whereClause}`;
      const [countRows] = await pool.execute(countQuery, params);
      const totalItems = countRows[0].totalItems;

      const limit = parseInt(itemsPerPage, 10);
      let page = parseInt(currentPage, 10);

      const totalPages = Math.ceil(totalItems / limit) || 1;

      if (page > totalPages) {
        page = 1;
      }

      const offset = (page - 1) * limit;
      const dataQuery = `SELECT * FROM tbl_contact_us${whereClause} ORDER BY created_on DESC LIMIT ${limit} OFFSET ${offset}`;

      const [messages] = await pool.execute(dataQuery, params);

      return { messages, totalItems, currentPage: page };
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      throw new Error("Failed to fetch contact messages");
    }
  },

  updateStatus: async (status, contact_id) => {
    try {
      const query = `UPDATE tbl_contact_us SET status = ? WHERE contact_id = ?`;
      const [rows] = await pool.execute(query, [status, contact_id]);
      return rows;
    } catch (error) {
      console.error("Error updating status", error);
      throw new Error("Failed to update status");
    }
  },

  // Verify admin token
  verifyAdminToken: async (adminId, token) => {
    return authService.verifyAdminToken(adminId, token);
  },
};

module.exports = contactService;
