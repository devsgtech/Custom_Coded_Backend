// const User = require("../models/userModel");
// exports.getUsers = (req, res) => {
//   User.getAllUsers((err, results) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//     } else {
//       res.json(results);
//     }
//   });
// };

// exports.createUser = (req, res) => {
//   const newUser = req.body;
//   User.createUser(newUser, (err, results) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//     } else {
//       res.status(201).json({ id: results.insertId, ...newUser });
//     }
//   });
// };
const userService = require('../services/userService');
const ipBanService = require('../services/ipBanService');
const response = require('../utils/response');
const { ERROR_MESSAGES,GeneralLogTypes } = require('../config/constants')
const {UserLoginSchema} = require('../middleware/Validation')

const userLogin = async (req, res) => {
  // const { email, password } = req.body;
  // console.log("req",req);
  // console.log("res",res);
  try {
    // const ip_address = req.ip
      
      const { error, value } = UserLoginSchema.validate(req.body);
      if (error) {
          return response.validationError(res, error.details[0].message.replace(/"/g, ''));
      }
      const { generated_code_id, generated_code,session_ip,session_timezone, session_country } = value;

      const checkIpBanned = await ipBanService.checkIpBanned(session_ip);
      console.log("&&&&&&&&&&&&&",checkIpBanned)
      console.log("&&&&&&&&&&&&&1",res)
      if (checkIpBanned.isBanned) {
        return response.unauthorized(res, "IP is banned",checkIpBanned );
    }

      
      // Get user code ID from database
      const user = await userService.findUserByCodeID(generated_code_id);
      if (!user) {
          const d = await ipBanService.recordFailedAttempt(session_ip,"Failed Login");
          return response.unauthorized(res, ERROR_MESSAGES.INVALID_CODE_ID,d);
      }
      console.log("*******************USER - ",user)
      // Verify user code from database
      const isValidCode = await userService.verifyCode(generated_code, user.generated_code);
      if (!isValidCode) {
        console.log("&&&&&&&&&&&&&2",res)
        const d = await ipBanService.recordFailedAttempt(session_ip,"Failed Login");
        return response.unauthorized(res, ERROR_MESSAGES.INVALID_CODE,d);
      } else {
        // Reset ban information after successful verification
        await ipBanService.resetBanInfo(session_ip);
      }

      // Generate User JWT token and get expiry
      const token = userService.generateUserToken(user);
      const tokenExpiry = userService.getUserTokenExpiry();

      // Create admin session with token
      await userService.createUserSession(
          user.code_id,
          token,
          tokenExpiry,
          session_ip,
          GeneralLogTypes.LOGIN,
          session_timezone,
          session_country
      );

      // Return success response (without exposing token expiry)
      return response.success(res, {
          token,
          user: {
              code_id: user.code_id,
              generated_code_id: user.generated_code_id,
              tokenExpiry:tokenExpiry

          }
      }, ERROR_MESSAGES.USER_LOGIN_SUCCESS);

  } catch (error) {
      console.error('Login error:', error);
      return response.error(res, {
          message: error.message,
          stack: error.stack,
          code: error.code,
          sqlMessage: error.sqlMessage,
          sqlState: error.sqlState
      }, 500);
  }
};

// Verify Code
// const verifyCode = async (req, res) => {
//     try {
//         const { code_id, code } = req.body;
//         const ip_address = req.ip;

//         // First check if IP is banned
//         const banStatus = await ipBanService.checkIpBanned(ip_address);
//         if (banStatus.isBanned) {
//             return response.forbidden(res, {
//                 message: ERROR_MESSAGES.IP_BANNED,
//                 banDetails: {
//                     banned_at: banStatus.banned_at,
//                     ban_duration: banStatus.ban_duration,
//                     ban_expires_at: banStatus.ban_expires_at,
//                     reason: banStatus.reason
//                 }
//             });
//         }

//         // Reset ban count if ban has expired
//         await ipBanService.resetBanCount(ip_address);

//         // Find user by code ID
//         const user = await userService.findUserByCodeID(code_id);
//         if (!user) {
//             return response.notFound(res, ERROR_MESSAGES.INVALID_CODE_ID);
//         }

//         // Verify code
//         if (user.generated_code !== code) {
//             // Record failed attempt
//             const banResult = await ipBanService.recordFailedAttempt(
//                 ip_address, 
//                 'Invalid verification code'
//             );

//             if (banResult.isBanned) {
//                 return response.forbidden(res, {
//                     message: ERROR_MESSAGES.IP_BANNED,
//                     banDetails: {
//                         ban_duration: banResult.banDuration,
//                         reason: 'Multiple failed attempts'
//                     }
//                 });
//             }

//             return response.unauthorized(res, ERROR_MESSAGES.INVALID_CODE);
//         }

//         // Code is valid, proceed with login
//         const token = await userService.generateToken(user);
//         return response.success(res, { token }, ERROR_MESSAGES.LOGIN_SUCCESS);
//     } catch (error) {
//         console.error('Error in verifyCode:', error);
//         return response.error(res, error.message);
//     }
// };

module.exports = {
  userLogin
}; 