import express from "express";
const sellerProductRouter = express.Router();
import {
  getAllProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/sellerProductController.js";
import verifyAuth from "../services/verifyAuth.js";

sellerProductRouter.get("/getAllProduct", verifyAuth, getAllProduct);

sellerProductRouter.post("/addProduct", verifyAuth, addProduct);

sellerProductRouter.patch("/updateProduct/:id", verifyAuth, updateProduct);

sellerProductRouter.delete("/deleteProduct/:id", verifyAuth, deleteProduct);



export default sellerProductRouter;
