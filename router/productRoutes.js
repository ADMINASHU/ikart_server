import express from "express";
const productRouter = express.Router();
import productModel from "../modules/productSchema.js";
import sellerProductRouter from "./sellerProductRoutes.js";

productRouter.get("/getAllProduct", async (req, res) => {
  try {
    const dbProduct = await productModel.find();
    res.status(200).send(dbProduct);
  } catch (error) {
    console.log(error);
  }
});

productRouter.get("/getProduct/:id", async (req, res) => {
  try {
    const getProduct = await productModel.findOne({ _id: req.params.id });
    res.status(200).send(getProduct);
  } catch (error) {
    console.log(error);
  }
});

productRouter.get("/searchProduct/:key", async (req, res) => {
  try {
    const product = req.params.key;
    if (!product) return res.send({});
    const getProduct = await productModel.find({
      $or: [
        { productName: { $regex: product } },
        { productCategory: { $regex: product } },
        { productCode: product },
      ],
    });
    res.status(200).send(getProduct);
  } catch (error) {
    console.log(error);
  }
});
// not in use
productRouter.get("/getLimitProduct/:num", async (req, res) => {
  try {
    const dbProduct = await productModel.find().limit(req.params.num);
    res.status(200).send(dbProduct);
  } catch (error) {
    console.log(error);
  }
});

productRouter.use("/seller", sellerProductRouter);

export default productRouter;
