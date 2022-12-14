import jwt from "jsonwebtoken";

function verifyToken(req, res, next) {
  const acsToken = req.headers["authorization"];
  if (acsToken) {
    jwt.verify(acsToken, process.env.ACCESS_SECRET_KEY, (err, valid) => {
      if (valid) {
        next();
      } else {
        res.status(401).json({ err: "Unauthorized Token" });
      }
    });
  } else {
    res.status(403).json({ err: "Access Token not available" });
  }
}

export default verifyToken;
