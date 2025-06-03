const pool = require('../config/database');

const ipBanService = {
    // Check if IP is banned
    checkIpBanned: async (ip_address) => {
        try {
            // First check if there's an expired ban and reset it
            const resetQuery = `
                UPDATE tbl_banned_ips 
                SET is_ban = 0, ban_count = 0 
                WHERE ip_address = ? 
                AND is_ban = 1 
                AND ban_expires_at <= NOW()
            `;
            await pool.execute(resetQuery, [ip_address]);

            // Then check for active ban
            const query = `
                SELECT 
                    banned_at,
                    ban_duration,
                    ban_expires_at,
                    reason,
                    ban_count,
                    is_ban
                FROM tbl_banned_ips 
                WHERE ip_address = ?
            `;
            const [result] = await pool.execute(query, [ip_address]);
            
            if (result.length > 0) {
                const banInfo = result[0];
                return {
                    isBanned: banInfo.is_ban === 1,
                    banInfo: {
                        banned_at: banInfo.banned_at,
                        ban_duration: banInfo.ban_duration,
                        ban_expires_at: banInfo.ban_expires_at,
                        reason: banInfo.reason,
                        ban_count: banInfo.ban_count,
                        is_ban: banInfo.is_ban === 1,
                        returnremaningtime: banInfo.ban_expires_at - new Date()

                    }
                };
            }
            
            return { 
                isBanned: false,
                banInfo: null
            };
        } catch (error) {
            console.error('Error checking IP ban:', error);
            throw error;
        }
    },

    // Record failed attempt
    recordFailedAttempt: async (ip_address, reason) => {
        try {
            // First check if IP exists in the table
            const checkQuery = `
                SELECT ban_count, ban_duration 
                FROM tbl_banned_ips 
                WHERE ip_address = ?
            `;
            const [existing] = await pool.execute(checkQuery, [ip_address]);

            if (existing.length === 0) {
                // First time entry
                const insertQuery = `
                    INSERT INTO tbl_banned_ips (
                        ip_address, 
                        banned_at, 
                        ban_duration, 
                        ban_expires_at,
                        reason, 
                        is_ban, 
                        ban_count
                    ) VALUES (?, NOW(), 0, NOW(), ?, 0, 1)
                `;
                await pool.execute(insertQuery, [ip_address, reason]);
                return { 
                    banCount: 1, 
                    isBanned: false,
                    banInfo: {
                        banned_at: new Date(),
                        ban_duration: 0,
                        ban_expires_at: new Date(),
                        reason: reason,
                        ban_count: 1
                    }
                };
            }

            // Update existing record
            const currentCount = existing[0].ban_count + 1;
            let banDuration = existing[0].ban_duration;
            let isBan = 0;

            if (currentCount >= 3) {
                // Increase ban duration by 1 minute, but not more than 120 minutes
                banDuration = Math.min(banDuration + 1, 120);
                isBan = 1;
            }

            const updateQuery = `
                UPDATE tbl_banned_ips 
                SET 
                    banned_at = NOW(),
                    ban_duration = ?,
                    ban_expires_at = DATE_ADD(NOW(), INTERVAL ? MINUTE),
                    reason = ?,
                    is_ban = ?,
                    ban_count = ?
                WHERE ip_address = ?
            `;
            await pool.execute(updateQuery, [
                banDuration,
                banDuration,
                reason,
                isBan,
                currentCount,
                ip_address
            ]);

            // Get updated ban information
            const getBanInfoQuery = `
                SELECT 
                    banned_at,
                    ban_duration,
                    ban_expires_at,
                    reason,
                    ban_count
                FROM tbl_banned_ips 
                WHERE ip_address = ?
            `;
            const [banInfo] = await pool.execute(getBanInfoQuery, [ip_address]);

            return {
                banCount: currentCount,
                isBanned: isBan === 1,
                banDuration: banDuration,
                banInfo: banInfo[0]
            };
        } catch (error) {
            console.error('Error recording failed attempt:', error);
            throw error;
        }
    },

    // Reset ban count after ban expires
    resetBanCount: async (ip_address) => {
        try {
            const query = `
                UPDATE tbl_banned_ips 
                SET ban_count = 0 
                WHERE ip_address = ? 
                AND ban_expires_at <= NOW()
            `;
            await pool.execute(query, [ip_address]);
        } catch (error) {
            console.error('Error resetting ban count:', error);
            throw error;
        }
    },

    // Reset ban information after successful verification
    resetBanInfo: async (ip_address) => {
        try {
            const query = `
                UPDATE tbl_banned_ips 
                SET 
                    ban_duration = 0,
                    reason = NULL,
                    ban_count = 0,
                    is_ban = 0
                WHERE ip_address = ?
            `;
            await pool.execute(query, [ip_address]);
            return { success: true };
        } catch (error) {
            console.error('Error resetting ban info:', error);
            throw error;
        }
    }
};

module.exports = ipBanService; 