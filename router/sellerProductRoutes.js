import express from "express";
const sellerProductRouter = express.Router();
import productModel from "../modules/productSchema.js";
import verifyToken from "../services/jwtVerify.js";


sellerProductRouter.get("/getProducts/:uid", verifyToken, async (req, res) => {
  try {
    const sellerProduct = await productModel.find({
      productSellers: req.params.uid,
    });
    // console.log(sellerProduct);
    res.status(200).send(sellerProduct);
  } catch (error) {
    console.log(error);
  }
});

sellerProductRouter.post("/addProduct", verifyToken, async (req, res) => {
  const {
    productName,
    productPrice,
    productQuantity,
    productCategory,
    productImage,
    productColor,
    productCode,
    sellerName,
    productDiscount,
  } = req.body;
  if (
    !productName ||
    !productPrice ||
    !productQuantity ||
    !productCategory ||
    !productImage ||
    !productColor ||
    !productCode ||
    !sellerName ||
    !productDiscount
  )
    return res.status(400).json({ error: "please fill all field" });
  try {
    const product = new productModel({
      productName: productName,
      productPrice: productPrice,
      productQuantity: productQuantity,
      productCategory: productCategory,
      productImage: productImage,
      productColor: productColor,
      productCode: productCode,
      productSellers: sellerName,
      productDiscount: productDiscount,
    });
    await product.save();
    res.status(201).json({ msg: "Product added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Adding Product failed" });
  }
});

sellerProductRouter.put("/updateProduct/:id", verifyToken, async (req, res) => {
  const {
    productName,
    productPrice,
    productQuantity,
    productCategory,
    productImage,
    productColor,
    productCode,
  } = req.body;
  if (
    !productName ||
    !productPrice ||
    !productQuantity ||
    !productCategory ||
    !productImage ||
    !productColor ||
    !productCode
  )
    return res.status(400).json({ error: "please fill all field" });
  try {
    const updateProduct = await productModel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          productName: productName,
          productPrice: productPrice,
          productQuantity: productQuantity,
          productCategory: productCategory,
          productImage: productImage,
          productColor: productColor,
          productCode: productCode,
        },
      }
    );
    res.status(200).send(updateProduct);
  } catch (error) {
    console.log(error);
  }
});

sellerProductRouter.delete("/deleteProduct/:id", verifyToken, async (req, res) => {
  try {
    const deleteProduct = await productModel.deleteOne({ _id: req.params.id });
    res.status(200).send(deleteProduct);
  } catch (error) {
    console.log(error);
  }
});

export default sellerProductRouter;
