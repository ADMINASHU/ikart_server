import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import userModel from "../modules/userSchema.js";

const verifyAuth = expressAsyncHandler(async (req, res, next) => {
  const token = req.cookies.jwtToken;
  if (!token) {
    res.status(401);
    throw new Error("Token not available");
  }
  
  // verify Token
  const verified = await jwt.verify(token, process.env.REFRESH_SECRET_KEY);
 
  // Get User Id from Token
  const user = await userModel.findById(verified.id).select("-password");
  if (!user) {
    res.status(401);
    throw new Error("Unauthorized Token");
  }
  req.user = user;
  next();
});

export default verifyAuth;
