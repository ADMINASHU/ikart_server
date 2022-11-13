import express from "express";
import { updateItem, getItems, removeItem, isItemInWishlist } from "../controllers/WishlistController.js";
const wishlistRouter = express.Router();
import verifyAuth from "../services/verifyAuth.js";


wishlistRouter.get("/getItems", verifyAuth, getItems);
wishlistRouter.put("/updateItem", verifyAuth, updateItem);
wishlistRouter.put("/removeItem/:id", verifyAuth, removeItem);
wishlistRouter.get("/isItemInWishlist/:id", verifyAuth, isItemInWishlist);





export default wishlistRouter;
