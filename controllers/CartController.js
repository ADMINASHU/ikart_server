import expressAsyncHandler from "express-async-handler";
import userModel from "../modules/userSchema.js";
import productModel from "../modules/productSchema.js";
// import { ObjectId } from 'mongodb'

// get Cart Items
const getItems = expressAsyncHandler(async (req, res) => {
  const dbProduct = await productModel.find({
    _id: { $in: req.user.cart.map((item) => item.item) },
  });

  // delete unmatched cart items
  await dbProduct.map((product) => {
    const cartItem = req.user.cart.filter((cart) => {
      if (cart.item != product._doc._id.toString()) {
        return cart;
      }
    });
    cartItem.map(async (cart) => {
      await userModel.findByIdAndUpdate(req.user._id, {
        $pull: {
          cart: { item: cart.item },
        },
      });
    });
  });

  // create new product
  const newProduct = await dbProduct.map((product) => {
    const cartItem = req.user.cart.filter((cart) => {
      if (cart.item == product._doc._id.toString()) {
        return cart;
      }
    });
    return {
      ...product._doc,
      count: cartItem[0].count,
      price: product._doc.productPrice * cartItem[0].count,
      discount: product._doc.productDiscount * cartItem[0].count,
    };
  });

  const totalCartCount = newProduct.reduce(
    (partialSum, elem) => partialSum + elem.count,
    0
  );

  const totalCartPrice = newProduct.reduce(
    (partialSum, elem) => partialSum + elem.price,
    0
  );

  const totalCartDiscount = newProduct.reduce(
    (partialSum, elem) => partialSum + elem.discount,
    0
  );

  const totalCartAmount = totalCartPrice - totalCartDiscount;

  res.status(200).json({
    cartItems: newProduct,
    itemCount: newProduct.length,
    cartCount: totalCartCount,
    cartPrice: totalCartPrice,
    cartDiscount: totalCartDiscount,
    CartAmount: totalCartAmount,
  });
});

// add Cart Item
const addItem = expressAsyncHandler(async (req, res) => {
  const { id, count } = req.body;

  const existUser = await userModel.findById(req.user._id);

  const existItem = existUser?.cart.filter((elem) => {
    if (elem.item === id) {
      return elem;
    } else {
      return null;
    }
  });

  // console.log("afaaggagagag", existItem);

  if (existItem?.length) {
    await userModel.findByIdAndUpdate(req.user._id, {
      $pull: {
        cart: { item: id },
      },
    });
    if (count > 0) {
      await userModel.findByIdAndUpdate(req.user._id, {
        $push: {
          cart: { item: id, count: count },
        },
      });
    } else {
      await userModel.findByIdAndUpdate(req.user._id, {
        $pull: {
          cart: { item: id },
        },
      });
    }
    res.status(201).json({ massage: "Product count is updated" });
  } else {
    await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          cart: { item: id, count: count },
        },
      },
      {
        new: true,
        useFindAndModify: false,
      }
    );
    res.status(201).json({ massage: "Product added in Cart" });
  }
});

// remove Cart Item
const removeItem = expressAsyncHandler(async (req, res) => {
  await userModel.findByIdAndUpdate(req.user._id, {
    $pull: {
      cart: { item: req.params.id },
    },
  });
  res.status(200).json({ massage: "Product remove from Cart" });
});

// ################################################################

export { getItems, addItem, removeItem };
