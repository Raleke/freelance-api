const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('roleMiddleware - req.user:', req.user);
    console.log('roleMiddleware - allowedRoles:', allowedRoles);
    if (
      !req.user ||
      !allowedRoles.some(
        (role) =>
          (typeof role === "string" ? role.trim().toLowerCase() : role) ===
          (typeof req.user.role === "string" ? req.user.role.trim().toLowerCase() : req.user.role)
      )
    ) {
      return res.status(403).json({ msg: "Forbidden: insufficient permissions" });
    }
    next();
  };
};

module.exports = roleMiddleware;
