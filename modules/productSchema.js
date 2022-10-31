import mongoose from "mongoose";


//product schema
const productSchema = new mongoose.Schema({
  productName: String,
  productPrice: Number,
  productQuantity: Number,
  productCategory: String,
  productImage: String,
  productColor: String,
  productCode: String,
  productSellers: String,
  productDiscount: Number,
})

const productModel = new mongoose.model("products", productSchema);

export default productModel;
