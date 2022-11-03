import express from "express";
import { addItem, getCartItemCount, getItems, getTotalCartCount, removeItem } from "../controllers/CartController.js";
const cartRouter = express.Router();
import verifyAuth from "../services/verifyAuth.js";


cartRouter.get("/getItems", verifyAuth, getItems);
cartRouter.put("/addItem", verifyAuth, addItem);
cartRouter.put("/removeItem/:id", verifyAuth, removeItem);
cartRouter.get("/getCartItemCount/:id", verifyAuth, getCartItemCount);
cartRouter.get("/getTotalCartCount", verifyAuth, getTotalCartCount);


export default cartRouter;
