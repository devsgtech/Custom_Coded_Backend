const pool = require('../config/database');
const authService = require('./authService');

const metaService = {
    // Get all Categories
    getAllMetas: async (metaGroup) => {
        try {
            // Support comma-separated meta groups: "1,2,3"
            const groups = metaGroup.split(',').map(g => g.trim());
    
            // Prepare placeholders like "?, ?, ?"
            const placeholders = groups.map(() => '?').join(', ');
    
            const query = `
                SELECT meta_id, meta_key, meta_value, meta_group, remarks
                FROM tbl_meta_info
                WHERE is_delete = 0 
                AND meta_group IN (${placeholders})
                ORDER BY created_on DESC
            `;
    
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
    
    getMetaDetails: async (metaGroup) => {
        try {
            // Support comma-separated meta groups: "1,2,3"
            const groups = metaGroup.split(',').map(g => g.trim());
    
            // Prepare placeholders like "?, ?, ?"
            const placeholders = groups.map(() => '?').join(', ');
    
            const query = `
                SELECT meta_id, meta_key, meta_value, meta_group, remarks
                FROM tbl_meta_info
                WHERE is_delete = 0 
                AND meta_id IN (${placeholders})
                ORDER BY created_on DESC
            `;
    
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
                INSERT INTO tbl_meta_info (meta_key, meta_value, meta_group, remarks, created_on, is_delete) 
                VALUES (?, ?, ?, ?, NOW(), ?)
            `;
            const [result] = await pool.execute(query, [meta_data.meta_key, meta_data.meta_value, meta_data.meta_group, meta_data.meta_remarks, meta_data.is_delete]);
            return result.insertId;
        } catch (error) {
            console.error('Error creating Meta:', error);
            throw new Error('Failed to create Meta');
        }
    },

    // Verify admin token
    verifyAdminToken: async (adminId, token) => {
        return authService.verifyAdminToken(adminId, token);
    }
};

module.exports = metaService; 