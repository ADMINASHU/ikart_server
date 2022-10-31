import express from "express";
import { addItem, getItems, removeItem } from "../controllers/CartController.js";
const cartRouter = express.Router();
import verifyAuth from "../services/verifyAuth.js";


cartRouter.get("/", verifyAuth, getItems);
cartRouter.put("/", verifyAuth, addItem);
cartRouter.put("/:id", verifyAuth, removeItem);


export default cartRouter;
