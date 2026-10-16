const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function authenticateToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    };
    req.authUser = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
  }
  next();
}

module.exports = { authenticateToken, optionalAuth };
