const jwt = require("jsonwebtoken");
const User = require("../models/User");

/** Attaches req.user when token present; continues anonymously otherwise */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) token = authHeader.split(" ")[1];
    else if (req.cookies?.accessToken) token = req.cookies.accessToken;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (user) req.user = user;
    }
    next();
  } catch {
    next();
  }
};

module.exports = { optionalAuth };
