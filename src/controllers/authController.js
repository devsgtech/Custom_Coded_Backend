const authService = require('../services/authService');
const ipBanService = require('../services/ipBanService');
const response = require('../utils/response');
const { ERROR_MESSAGES } = require('../config/constants');

// Verify Code
const verifyCode = async (req, res) => {
    try {
        const { code_id, code } = req.body;
        const ip_address = req.ip;

        // First check if IP is banned
        const banStatus = await ipBanService.checkIpBanned(ip_address);
        if (banStatus.isBanned) {
            return response.forbidden(res, {
                message: ERROR_MESSAGES.IP_BANNED,
                banDetails: {
                    banned_at: banStatus.banned_at,
                    ban_duration: banStatus.ban_duration,
                    ban_expires_at: banStatus.ban_expires_at,
                    reason: banStatus.reason
                }
            });
        }

        // Reset ban count if ban has expired
        await ipBanService.resetBanCount(ip_address);

        // Find user by code ID
        const user = await authService.findUserByCodeID(code_id);
        if (!user) {
            return response.notFound(res, ERROR_MESSAGES.INVALID_CODE_ID);
        }

        // Verify code
        if (user.generated_code !== code) {
            // Record failed attempt
            const banResult = await ipBanService.recordFailedAttempt(
                ip_address, 
                'Invalid verification code'
            );

            if (banResult.isBanned) {
                return response.forbidden(res, {
                    message: ERROR_MESSAGES.IP_BANNED,
                    banDetails: {
                        ban_duration: banResult.banDuration,
                        reason: 'Multiple failed attempts'
                    }
                });
            }

            return response.unauthorized(res, ERROR_MESSAGES.INVALID_CODE);
        }

        // Code is valid, proceed with login
        const token = await authService.generateToken(user);
        return response.success(res, { token }, ERROR_MESSAGES.LOGIN_SUCCESS);
    } catch (error) {
        console.error('Error in verifyCode:', error);
        return response.error(res, error.message);
    }
}; 