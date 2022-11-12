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

// get cat Product
const getCatProduct = expressAsyncHandler(async (req, res) => {
  const dbProduct = await productModel.find();
  if (!dbProduct) {
    res.status(400);
    throw new Error("Product not available");
  }

  // program to get a random item from an array

  function randomNoRepeats(array) {
    var copy = array.slice(0);
    return function () {
      if (copy.length < 1) {
        copy = array.slice(0);
      }
      var index = Math.floor(Math.random() * copy.length);
      var item = copy[index];
      copy.splice(index, 1);
      return item;
    };
  }

  // get unique cat of product @ Array
  const uniqueCatArray = await dbProduct
    .map((product) => product.productCategory)
    .filter((v, i, a) => a.indexOf(v) === i);

  // get random product from unique cat Array
  const catChooser = randomNoRepeats(uniqueCatArray);

  const randomCatArray = await uniqueCatArray
    .map(() => catChooser())
    .splice(0, 4);

  // get filtered product  Arr from all product Array based on unique cat
  const randomProdArray = await randomCatArray
    .map((cat) =>
      dbProduct?.filter((product) => product.productCategory === cat)
    )
    .map((ProductArray, index) => {
      const chooser = randomNoRepeats(ProductArray);
      return ProductArray.map(() => chooser()).splice(0, 4);
    });
  res.status(200).json({
    cat: randomCatArray,
    prod: randomProdArray,
  });
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

export {
  getAllProduct,
  getCatProduct,
  getProduct,
  searchProduct,
  getLimitProduct,
};
