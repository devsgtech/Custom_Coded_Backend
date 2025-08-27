function authorizeRoles(allowedRoles = []) {
  return (req, res, next) => {
    const userRoles = req.user.role || [];
    const isAuthorized = allowedRoles.some(role => userRoles.includes(role));

    if (!isAuthorized) return res.status(403).json({ message: "Forbidden" });

    next();
  };
}

module.exports = authorizeRoles;