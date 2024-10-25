const jwt = require("jsonwebtoken");

function createToken(userEmail, password) {
  return jwt.sign({ data: { userEmail, password } }, process.env.SecretKey);
}

function verifyToken(token, userEmail, password) {
  try {
    const decoded = jwt.verify(token, process.env.SecretKey);
    if (
      decoded.data.userEmail === userEmail &&
      decoded.data.password === password
    ) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
function verifyTokenMiddleware(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SecretKey);

    req.user = decoded.data;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token." });
  }
}
module.exports = { createToken, verifyToken, verifyTokenMiddleware };
