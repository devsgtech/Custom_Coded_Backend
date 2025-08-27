const pool = require("../config/database");
const authService = require("./authService");
const path = require("path");

const metaService = {
<<<<<<< Updated upstream
    // Get all Categories
    getAllMetas: async (metaGroup) => {
        try {
            // Support comma-separated meta groups: "1,2,3"
            const groups = metaGroup.split(',').map(g => g.trim());
    
            // Prepare placeholders like "?, ?, ?"
            const placeholders = groups.map(() => '?').join(', ');
    
            const query = `
                SELECT meta_id, meta_key, meta_value, meta_group
=======
  // Get all Categories
  getAllMetas: async (metaGroup) => {
    try {
      // Support comma-separated meta groups: "1,2,3"
      const groups = metaGroup.split(",").map((g) => g.trim());

      // Prepare placeholders like "?, ?, ?"
      const placeholders = groups.map(() => "?").join(", ");

      const query = `
                SELECT meta_id, meta_key, meta_value, meta_group, remarks
>>>>>>> Stashed changes
                FROM tbl_meta_info
                WHERE is_delete = 0 
                AND meta_group IN (${placeholders})
                ORDER BY created_on DESC
            `;
<<<<<<< Updated upstream
    
            const [rows] = await pool.execute(query, groups);
    
            if (rows.length === 0) {
                return { success: false, message: 'Meta data not found', data: [] };
            }
    
            return { success: true, data: rows };
        } catch (error) {
            console.error('Error fetching Metas:', error);
            throw new Error('Failed to fetch Metas');
        }
    },
    

    // Create new meta
    createMeta: async (meta_data) => {
        try {
            const query = `
                INSERT INTO tbl_meta_info (meta_key, meta_value, meta_group, created_on, is_delete) 
                VALUES (?, ?, ?, NOW(), ?)
            `;
            const [result] = await pool.execute(query, [meta_data.meta_key, meta_data.meta_value, meta_data.meta_group, meta_data.is_delete]);
            return result.insertId;
        } catch (error) {
            console.error('Error creating Meta:', error);
            throw new Error('Failed to create Meta');
        }
    },
=======

      const [rows] = await pool.execute(query, groups);

      if (rows.length === 0) {
        return { success: false, message: "Meta data not found", data: [] };
      }

      return { success: true, data: rows };
    } catch (error) {
      console.error("Error fetching Metas:", error);
      throw new Error("Failed to fetch Metas");
    }
  },

  fetchMetaById: async (metaId) => {
    try {
      const query = `SELECT * FROM tbl_meta_info WHERE meta_id = ? AND is_delete = 0`;
      const [data] = await pool.execute(query, [metaId]);

      if (data.length === 0) {
        return { success: false, message: "Meta data not found", data: [] };
      }

      return { success: true, data: data };
    } catch (error) {
      console.error("Error fetching Metas:", error);
      throw new Error("Failed to fetch Metas");
    }
  },

  getMetaDetails: async (metaGroup) => {
    try {
      // Support comma-separated meta groups: "1,2,3"
      const groups = metaGroup.split(",").map((g) => g.trim());

      // Prepare placeholders like "?, ?, ?"
      const placeholders = groups.map(() => "?").join(", ");

      const query = `
                SELECT meta_id, meta_key, meta_value, meta_group, remarks
                FROM tbl_meta_info
                WHERE is_delete = 0 
                AND meta_id IN (${placeholders})
                ORDER BY created_on DESC
            `;
>>>>>>> Stashed changes

      const [rows] = await pool.execute(query, groups);

      if (rows.length === 0) {
        return { success: false, message: "Meta data not found", data: [] };
      }

      return { success: true, data: rows };
    } catch (error) {
      console.error("Error fetching Metas:", error);
      throw new Error("Failed to fetch Metas");
    }
  },

  fetchAllMetas: async (currentPage, itemsPerPage, filters, search) => {
    try {
      let whereClause = " WHERE 1=1";
      const params = [];

      if (filters && Array.isArray(filters)) {
        filters.forEach((filter) => {
          if (
            filter.field === "meta_group" &&
            Array.isArray(filter.value) &&
            filter.value.length > 0
          ) {
            const placeholders = filter.value.map(() => "?").join(",");
            whereClause += ` AND meta_group IN (${placeholders})`;
            params.push(...filter.value);
          } else if (
            filter.field === "asset_type" &&
            Array.isArray(filter.value) &&
            filter.value.length > 0
          ) {
            const placeholders = filter.value.map(() => "?").join(",");
            whereClause += ` AND asset_type IN (${placeholders})`;
            params.push(...filter.value);
          }
        });
      }

      if (search) {
        whereClause += ` AND (meta_key LIKE ? OR meta_value LIKE ?)`;
        const searchKeyword = `%${search}%`;
        params.push(searchKeyword, searchKeyword);
      }

      const countQuery = `SELECT COUNT(*) as totalItems FROM tbl_meta_info${whereClause}`;
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

      const dataQuery = `SELECT * FROM tbl_meta_info${whereClause} ORDER BY created_on ASC${limitClause}`;
      const [metas] = await pool.execute(dataQuery, params);

      return { metas, totalItems, totalPages, currentPage: page };
    } catch (error) {
      console.error("Error fetching Metas:", error);
      throw new Error("Failed to fetch Metas");
    }
  },

  // Create new meta
  createMeta: async (meta_data) => {
    try {
      const query = `
                INSERT INTO tbl_meta_info (meta_key, meta_value, meta_group, remarks, created_on, is_delete) 
                VALUES (?, ?, ?, ?, NOW(), ?) 
            `;
      const [result] = await pool.execute(query, [
        meta_data.meta_key,
        meta_data.meta_value,
        meta_data.meta_group,
        meta_data.meta_remarks,
        meta_data.is_delete,
      ]);
      return result.insertId;
    } catch (error) {
      console.error("Error creating Meta:", error);
      throw new Error("Failed to create Meta");
    }
  },

  updateMetaAsset: async (meta_id, new_asset_filename) => {
    try {
      const [result] = await pool.execute(
        "UPDATE tbl_meta_info SET meta_value = ? WHERE meta_id = ?",
        [new_asset_filename, meta_id]
      );
      console.log(result);

      return {
        success: true,
        message: "Meta updated successfully",
        result,
      };
    } catch (error) {
      console.error("Error updating Meta:", error);
      throw new Error("Failed to update Meta");
    }
  },


  
  deleteMeta: async (meta_id) => {
    try {
      const [result] = await pool.execute(
        "UPDATE tbl_meta_info SET is_delete = 1 WHERE meta_id = ?",
        [meta_id]
      );
      return { success: true, message: "Meta deleted successfully", result };
    } catch (error) {
      console.error("Error deleting Meta:", error);
      throw new Error("Failed to delete Meta");
    }
  },

  // Verify admin token
  verifyAdminToken: async (adminId, token) => {
    return authService.verifyAdminToken(adminId, token);
  },
};

module.exports = metaService;
