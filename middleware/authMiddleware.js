const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Restrict to builders only
const builderOnly = (req, res, next) => {
  if (req.user && req.user.role === "builder") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Builders only." });
  }
};

// Restrict to consultants only
const consultantOnly = (req, res, next) => {
  if (req.user && req.user.role === "consultant") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Consultants only." });
  }
};

module.exports = { protect, builderOnly, consultantOnly };
