const jwt = require("jsonwebtoken");
const { safeUser } = require("./constants");

function signToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function authResponse(user, message = "Success") {
  return {
    message,
    token: signToken(user),
    user: safeUser(user),
  };
}

module.exports = { signToken, authResponse };
