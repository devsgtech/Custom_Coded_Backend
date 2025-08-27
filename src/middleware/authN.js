const jwt = require("jsonwebtoken");
const authService = require("../services/authService");
const response = require("../utils/response");
const { ERROR_MESSAGES } = require("../config/constants");

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1] || req.body.token;

  if (!token || token == null) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin_id = decoded.id;

    const isTokenValid = await authService.verifyAdminToken(admin_id, token);
    if (!isTokenValid) {
      return response.unauthorized(res, ERROR_MESSAGES.INVALID_OR_EXPIRE_TOKEN);
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

module.exports = authenticateToken;
