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

  // get unique cat of product @ Array
  const uniqueCatArray = await dbProduct
    .map((product) => product.productCategory)
    .filter((v, i, a) => a.indexOf(v) === i);

  // get random product from unique cat Array
  const randomCatArray = await uniqueCatArray
    .map((UPCat, index) => {
      const rCat =
        uniqueCatArray[Math.floor(Math.random() * uniqueCatArray.length)];
      const catIdx = uniqueCatArray.indexOf(rCat);
      if (catIdx !== -1) {
        uniqueCatArray.splice(catIdx, 1);
      }
      return rCat;
    })
    .splice(0, 4);

  // get filtered product  Arr from all product Array based on unique cat
  const ArrOfFilteredProdArray = await randomCatArray.map((cat) =>
    dbProduct?.filter((product) => product.productCategory === cat)
  );

  // console.log("randProd", ArrOfFilteredProdArray);
  // program to get a random item from an array

  function getRandomItem(arr) {
    // get random index value
    const randomIndex = Math.floor(Math.random() * arr.length);

    // get random item
    const item = arr[randomIndex];

    return item;
  }

  // get random products Arr from filtered prod array
  const randomProdArray = ArrOfFilteredProdArray.map((ProductArray) => {
    const res = ProductArray.map((element) => {
      const get = getRandomItem(ProductArray);
      return get;
    });
    const finaleRes = res.splice(0, 4);
    return finaleRes;
  });

  // send data
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
