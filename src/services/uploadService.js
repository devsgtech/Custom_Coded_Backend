const pool = require('../config/database');
const { Op } = require('sequelize');

const uploadService = {
    // Upsert generated video info by main_id
    upsertGeneratedVideoInfo: async ({
        main_id,
        file_path,
        text,
        text_font_style,
        text_font_color,
        text_font_alignment,
        background_path,
        overlay_path
    }) => {
        try {
            // Check if a record exists for this main_id
            const [existing] = await pool.execute(
                'SELECT video_id FROM tbl_generated_video_info WHERE code_id = ? LIMIT 1',
                [main_id]
            );

            if (existing.length > 0) {
                // Update existing record
                const updateQuery = `
                    UPDATE tbl_generated_video_info
                    SET
                        file_path = ?,
                        generated_time = NOW(),
                        text = ?,
                        text_font_style = ?,
                        text_font_color = ?,
                        text_font_alignment = ?,
                        background_path = ?,
                        overlay_path = ?,
                        final_video_generated = 0
                    WHERE code_id = ?
                `;
                await pool.execute(updateQuery, [
                    file_path || '',
                    text || null,
                    text_font_style || null,
                    text_font_color || null,
                    text_font_alignment || null,
                    background_path || null,
                    overlay_path || null,
                    main_id
                ]);
                return { success: true, updated: true };
            } else {
                // Insert new record
                const insertQuery = `
                    INSERT INTO tbl_generated_video_info (
                        code_id,
                        file_path,
                        generated_time,
                        text,
                        text_font_style,
                        text_font_color,
                        text_font_alignment,
                        background_path,
                        overlay_path,
                        final_video_generated
                    ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, 0)
                `;
                await pool.execute(insertQuery, [
                    main_id,
                    file_path || '',
                    text || null,
                    text_font_style || null,
                    text_font_color || null,
                    text_font_alignment || null,
                    background_path || null,
                    overlay_path || null
                ]);
                return { success: true, created: true };
            }
        } catch (error) {
            console.error('Error in upsertGeneratedVideoInfo:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage,
                params: {
                    main_id,
                    file_path,
                    text,
                    text_font_style,
                    text_font_color,
                    text_font_alignment,
                    background_path,
                    overlay_path
                }
            });
            return { success: false, error: `Failed to upsert generated video info: ${error.message}` };
        }
    },

    // Get generated video info by code_id
    getGeneratedVideoInfoByCodeId: async (code_id) => {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM tbl_generated_video_info WHERE code_id = ? LIMIT 1',
                [code_id]
            );
            return { success: true, data: rows[0] || null };
        } catch (error) {
            console.error('Error in getGeneratedVideoInfoByCodeId:', error);
            return { success: false, error: error.message };
        }
    },

    // Mark generated video as published
    markVideoAsPublished: async ({ id, final_video_path,email_address }) => {
        // console.log("final_video_path",final_video_path);
        // console.log("code_id",id);
        try {
            const query = `
                UPDATE tbl_generated_video_info
                SET final_video_generated = 1,
                Email_address = ? ,
                    final_video_generated_time = NOW(),
                    video_expiry_time = DATE_ADD(NOW(), INTERVAL 30 DAY),
                    final_video_path = ?
                WHERE code_id = ?
            `;
            const [result] = await pool.execute(query, [email_address, final_video_path, id]);
            return { success: true, affected: result.affectedRows };
        } catch (error) {
            console.error('Error in markVideoAsPublished:', error);
            return { success: false, error: error.message };
        }
    },
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

            // Validate required fields - only code_id is required for blank entries
            if (!params[1]) {
                throw new Error('code_id is required');
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
            // console.log('Result*******:', result);
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
    },

    // Check if user can download video based on category and time limits
    checkVideoDownloadEligibility: async ({ id, code_id }) => {
        try {
            // Get category info from tbl_generated_code and tbl_category
            const categoryQuery = `
                SELECT c.category_name 
                FROM tbl_generated_code gc
                JOIN tbl_category c ON gc.category_id = c.category_id
                WHERE gc.code_id = ?
            `;
            const [categoryRows] = await pool.execute(categoryQuery, [id]);
            
            if (categoryRows.length === 0) {
                return { success: false, error: 'Code ID not found' };
            }
            
            const categoryName = categoryRows[0].category_name;
            
            // Determine download limits based on category
            let maxDownloads, timeLimitHours;
            if (['P', 'E', 'M'].includes(categoryName)) {
                maxDownloads = 4;
                timeLimitHours = 2;
            } else if (['T', 'B'].includes(categoryName)) {
                maxDownloads = 20;
                timeLimitHours = 2;
            } else {
                return { success: false, error: 'Invalid category' };
            }
            
            // Get current download info
            const downloadQuery = `
                SELECT video_download_time, video_download_count
                FROM tbl_generated_video_info
                WHERE code_id = ?
            `;
            const [downloadRows] = await pool.execute(downloadQuery, [id]);
            
            if (downloadRows.length === 0) {
                return { success: false, error: 'Video info not found' };
            }
            
            const { video_download_time, video_download_count } = downloadRows[0];
            const now = new Date();
            
            // If no previous download time, it's first download
            if (!video_download_time) {
                // Update with first download
                const updateQuery = `
                    UPDATE tbl_generated_video_info
                    SET video_download_time = NOW(), video_download_count = 1
                    WHERE code_id = ?
                `;
                await pool.execute(updateQuery, [id]);
                
                return {
                    success: true,
                    is_download: true,
                    video_download_time: now,
                    video_download_count: 1,
                    category_name: categoryName,
                    max_downloads: maxDownloads,
                    time_limit_hours: timeLimitHours
                };
            }
            
            // Check if 2 hours have passed since last download
            const lastDownloadTime = new Date(video_download_time);
            const timeDiffHours = (now - lastDownloadTime) / (1000 * 60 * 60);
            
            if (timeDiffHours >= timeLimitHours) {
                // Reset download count and time
                const resetQuery = `
                    UPDATE tbl_generated_video_info
                    SET video_download_time = NOW(), video_download_count = 1
                    WHERE code_id = ?
                `;
                await pool.execute(resetQuery, [id]);
                
                return {
                    success: true,
                    is_download: true,
                    video_download_time: now,
                    video_download_count: 1,
                    category_name: categoryName,
                    max_downloads: maxDownloads,
                    time_limit_hours: timeLimitHours
                };
            }
            
            // Check if download count is within limit
            if (video_download_count < maxDownloads) {
                // Increment download count
                const incrementQuery = `
                    UPDATE tbl_generated_video_info
                    SET video_download_count = video_download_count + 1
                    WHERE code_id = ?
                `;
                await pool.execute(incrementQuery, [id]);
                
                return {
                    success: true,
                    is_download: true,
                    video_download_time: video_download_time,
                    video_download_count: video_download_count + 1,
                    category_name: categoryName,
                    max_downloads: maxDownloads,
                    time_limit_hours: timeLimitHours
                };
            }
            
            // Download limit reached
            return {
                success: true,
                is_download: false,
                video_download_time: video_download_time,
                video_download_count: video_download_count,
                category_name: categoryName,
                max_downloads: maxDownloads,
                time_limit_hours: timeLimitHours,
                message: 'Download limit reached for this time period'
            };
            
        } catch (error) {
            console.error('Error in checkVideoDownloadEligibility:', error);
            return { success: false, error: error.message };
        }
    }
};

module.exports = uploadService; 