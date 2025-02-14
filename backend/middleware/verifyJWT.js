const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
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
    req.email = decoded.userInfo.email;
    req.role = decoded.userInfo.role; //for role based access control
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  verifyJWT(req, res, (err) => {
    if (err) return next(err);
    if (req.role !== ROLES_LIST.Admin) {
      return res.sendStatus(403); // Forbidden
    }
    next();
  });
};

module.exports = { verifyJWT, verifyAdmin };
