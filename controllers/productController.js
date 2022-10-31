import expressAsyncHandler from "express-async-handler";
import productModel from "../modules/productSchema.js";

// get Product
const getAllProduct = expressAsyncHandler(async (req, res) => {
  const dbProduct = await productModel.find();
  if (!dbProduct) {
    res.status(400);
    throw new Error("Product not available");
  } else {
    res.status(200).json(dbProduct);
  }
});

// get Product by Id
const getProduct = expressAsyncHandler(async (req, res) => {
  const singleProduct = await productModel.findById(req.params.id);
  if (!singleProduct) {
    res.status(400);
    throw new Error("Product not found");
  } else {
    res.status(200).json(singleProduct);
  }
});
// search Product
const searchProduct = expressAsyncHandler(async (req, res) => {
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
// delete Product
const getLimitProduct = expressAsyncHandler(async (req, res) => {
  const limitProduct = await productModel.find().limit(req.params.num);
  if (!limitProduct) {
    res.status(400);
    throw new Error("Product not available");
  } else {
    res.status(200).json(limitProduct);
  }
});

export { getAllProduct, getProduct, searchProduct, getLimitProduct };
