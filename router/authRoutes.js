import express from "express";
const authRouter = express.Router();

import {
  isLoggedIn,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/authController.js";

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/logout", logoutUser);
authRouter.get("/isLoggedIn", isLoggedIn);

export default authRouter;
