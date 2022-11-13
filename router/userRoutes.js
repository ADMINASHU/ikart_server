import express from "express";
const userRouter = express.Router();
import { deleteUser, getUser, updateUser, updateUserPassword } from "../controllers/userController.js";
import verifyAuth from "../services/verifyAuth.js";
import cartRouter from "./CartRoutes.js";
import wishlistRouter from "./wishlistRouter.js";


userRouter.get("/getUser", verifyAuth, getUser);
userRouter.patch("/updateUser", verifyAuth, updateUser);
userRouter.patch("/updateUserPassword", verifyAuth, updateUserPassword);
userRouter.delete("/deleteUser", verifyAuth, deleteUser);

userRouter.use("/cart", cartRouter);
userRouter.use("/wishlist", wishlistRouter);

export default userRouter;
