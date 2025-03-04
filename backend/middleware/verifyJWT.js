const jwt = require("jsonwebtoken");
const logger = require("../logs/logger");

const verifyJWT = (req, res, next) => {
  if (process.env.NODE_ENV === "test") {
    req.user = {
      id: "67acb6c00a79cee04957d04b",
      role: "admin",
    };
    return next();
  }
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401); //unauthorized

  const token = authHeader.split(" ")[1]; //take out jwt
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Invalid JWT payload. Access Denied" });
    }
    //for role based access control
    req.user = decoded.user;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  verifyJWT(req, res, (err) => {
    if (err) return next(err);
    if (req.user.role !== "admin") {
      return res.sendStatus(403); // Forbidden
    }
    next();
  });
};

module.exports = { verifyJWT, verifyAdmin };
