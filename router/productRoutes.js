import express from "express";
import {
  getAllProduct,
  getProduct,
  getLimitProduct,
  searchProduct,
  getCatProduct,
} from "../controllers/productController.js";
const productRouter = express.Router();

import sellerProductRouter from "./sellerProductRoutes.js";

productRouter.get("/getAllProduct", getAllProduct);

productRouter.get("/getCatProduct", getCatProduct);

productRouter.get("/getProduct/:id", getProduct);

productRouter.get("/searchProduct/:key", searchProduct);
// not in use currently but further use in search for pagination
productRouter.get("/getLimitProduct/:num", getLimitProduct);

productRouter.use("/seller", sellerProductRouter);

export default productRouter;
