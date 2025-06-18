const pool = require('../config/database');
const { Op } = require('sequelize');

const uploadService = {
    // Create a new attachment record
    createAttachment: async (data) => {
        try {
            const query = `
                INSERT INTO tbl_uploaded_attachments 
                (uploded_video_path, code_id, created_on, uploaded_audio_path, uploaded_images_path, uploaded_background_path, columns_remarks) 
                VALUES (?, ?, NOW(), ?, ?, ?, ?)
            `;
            
            console.log('Creating attachment with params:', data);
            
            // Ensure all values are either the actual value or null (not undefined or empty string)
            const params = [
                data.uploded_video_path || null,
                data.code_id || null,
                data.uploaded_audio_path || null,
                data.uploaded_images_path || null,
                data.uploaded_background_path || null,
                data.columns_remarks || null
            ];

            // Validate required fields
            if (!params[0] || !params[1]) {
                throw new Error('uploded_video_path and code_id are required');
            }
            
            const [result] = await pool.execute(query, params);
            
            console.log('Attachment created with ID:', result.insertId);
            
            // Fetch the created record
            const [rows] = await pool.execute(
                'SELECT * FROM tbl_uploaded_attachments WHERE uploded_id = ?',
                [result.insertId]
            );
            
            return { 
                success: true, 
                data: rows[0] 
            };
        } catch (error) {
            console.error('Error in createAttachment:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage,
                params: data // Log the input data for debugging
            });
            return { 
                success: false, 
                error: `Failed to create attachment: ${error.message}` 
            };
        }
    },

    // Get attachment by ID
    getAttachmentById: async (uploded_id) => {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM tbl_uploaded_attachments WHERE uploded_id = ?',
                [uploded_id]
            );
            
            return { 
                success: true, 
                data: rows[0] 
            };
        } catch (error) {
            console.error('Error in getAttachmentById:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage
            });
            return { 
                success: false, 
                error: error.message 
            };
        }
    },

    // Get attachments by code_id
    getAttachmentsByCodeId: async (code_id) => {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM tbl_uploaded_attachments WHERE code_id = ? ORDER BY created_on DESC',
                [code_id]
            );
            
            return { 
                success: true, 
                data: rows 
            };
        } catch (error) {
            console.error('Error in getAttachmentsByCodeId:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage
            });
            return { 
                success: false, 
                error: error.message 
            };
        }
    },

    // Delete attachments by code_id
    deleteAttachmentsByCodeId: async (code_id) => {
        try {
            const [result] = await pool.execute(
                'DELETE FROM tbl_uploaded_attachments WHERE code_id = ?',
                [code_id]
            );
            
            return { 
                success: true, 
                data: { deletedCount: result.affectedRows } 
            };
        } catch (error) {
            console.error('Error in deleteAttachmentsByCodeId:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage
            });
            return { 
                success: false, 
                error: error.message 
            };
        }
    },

    // Update attachment by code_id
    updateAttachmentByCodeId: async (code_id, data) => {
        try {
            const query = `
                UPDATE tbl_uploaded_attachments 
                SET 
                    uploded_video_path = ?,
                    uploaded_audio_path = ?,
                    uploaded_images_path = ?,
                    uploaded_background_path = ?,
                    columns_remarks = ?
                WHERE code_id = ?
            `;
            
            console.log('Updating attachment with params:', { code_id, ...data });
            
            const params = [
                data.uploded_video_path || null,
                data.uploaded_audio_path || null,
                data.uploaded_images_path || null,
                data.uploaded_background_path || null,
                data.columns_remarks || null,
                code_id
            ];

            const [result] = await pool.execute(query, params);
            
            if (result.affectedRows === 0) {
                return { 
                    success: false, 
                    error: 'No attachment found for this code_id' 
                };
            }
            
            console.log('Attachment updated for code_id:', code_id);
            
            // Fetch the updated record
            const [rows] = await pool.execute(
                'SELECT * FROM tbl_uploaded_attachments WHERE code_id = ?',
                [code_id]
            );
            
            return { 
                success: true, 
                data: rows[0] 
            };
        } catch (error) {
            console.error('Error in updateAttachmentByCodeId:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage,
                params: { code_id, ...data }
            });
            return { 
                success: false, 
                error: `Failed to update attachment: ${error.message}` 
            };
        }
    }
};

module.exports = uploadService; 