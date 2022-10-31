import expressAsyncHandler from "express-async-handler";
import productModel from "../modules/productSchema.js";
import uploadImage from "../config/cloudinary.js";
import clearTempImage from "../services/clearTemp.js";

// get Product
const getAllProduct = expressAsyncHandler(async (req, res) => {
  const sellerProduct = await productModel.find({
    productSellers: req.user?._id,
  });
  if (!sellerProduct) {
    res.status(400);
    throw new Error("Product not found");
  }
  res.status(200).json(sellerProduct);
});

// add Product
const addProduct = expressAsyncHandler(async (req, res) => {
  const image = req.files?.productImage;
  const uploadResult = await uploadImage(image, "Products");
  const productImage = uploadResult?.secure_url;
  clearTempImage(image);
  const {
    productName,
    productPrice,
    productQuantity,
    productCategory,
    productColor,
    productCode,
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
    !productDiscount
  ) {
    res.status(400);
    throw new Error("please fill all required field");
  }

  const newProduct = await productModel.create({
    productName: productName,
    productPrice: productPrice,
    productQuantity: productQuantity,
    productCategory: productCategory,
    productImage: productImage,
    productColor: productColor,
    productCode: productCode,
    productSellers: req.user?._id,
    productDiscount: productDiscount,
  });
  if (newProduct) {
    res.status(201).json({ message: "New Product added successfully" });
  } else {
    res.status(500).json({ message: "Adding new Product failed" });
  }
});

// update Product
const updateProduct = expressAsyncHandler(async (req, res) => {
  const image = req.files?.productImage;
  const uploadResult = await uploadImage(image, "Products");
  const uploadImageURL = uploadResult?.secure_url;
  clearTempImage(image);
  // get seller product details
  const sellerProduct = await productModel.findById(req.params.id);
  if (sellerProduct) {
    const {
      productName,
      productPrice,
      productQuantity,
      productCategory,
      productImage,
      productColor,
      productCode,
    } = sellerProduct;

    sellerProduct.productName = req.body?.productName || productName;
    sellerProduct.productPrice = req.body?.productPrice || productPrice;
    sellerProduct.productQuantity =
      req.body?.productQuantity || productQuantity;
    sellerProduct.productCategory =
      req.body?.productCategory || productCategory;
    sellerProduct.productImage = uploadImageURL || productImage;
    sellerProduct.productColor = req.body?.productColor || productColor;
    sellerProduct.productCode = req.body?.productCode || productCode;

    // update in DB
    const updateSellerProduct = await sellerProduct.save();

    // Send response
    res.status(200).json(updateSellerProduct);
  } else {
    res.status(400);
    throw new Error("Product not found");
  }
});

// delete Product
const deleteProduct = expressAsyncHandler(async (req, res) => {
    const deleteProduct = await productModel.findByIdAndDelete(req.params.id);
    if(!deleteProduct){
        res.status(400);
        throw new Error("Product not found");
      }
    res.status(200).json({ Message: "Product deleted successfully" });

});

export { getAllProduct, addProduct, updateProduct, deleteProduct };
