import expressAsyncHandler from "express-async-handler";
import userModel from "../modules/userSchema.js";
import productModel from "../modules/productSchema.js";

// get wishlist Items
const getItems = expressAsyncHandler(async (req, res) => {
  const dbProduct = await productModel.find({
    _id: { $in: req.user.wishlist.map((item) => item.item) },
  });

  // create new product
  const newProduct = await dbProduct.map((product) => {
    req.user.wishlist.filter((wishlist) => {
      if (wishlist.item == product._doc._id.toString()) {
        return wishlist;
      }
    });
    return {
      ...product._doc,
    };
  });

  // send wishlist obj to front-end
  res.status(200).json({
    wishlistItems: newProduct,
    itemCount: newProduct.length,
  });
});

// update wishlist Item
const updateItem = expressAsyncHandler(async (req, res) => {
  const { id } = req.body;

  const existUser = await userModel.findById(req.user._id);

  const existItem = existUser?.wishlist.filter((elem) => {
    if (elem.item === id) {
      return elem;
    } else {
      return null;
    }
  });
  // console.log("existItem", existItem?.length);
  if (existItem?.length === 0) {
    await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          wishlist: { item: id },
        },
      },
      {
        new: true,
        useFindAndModify: false,
      }
    );
    res.status(201).json({ massage: "Item added from Wishlist" });
  } else {
    await userModel.findByIdAndUpdate(req.user._id, {
      $pull: {
        wishlist: { item: id },
      },
    });
    res.status(200).json({ massage: "Item remove from Wishlist" });
  }
});

// remove Cart Item
const removeItem = expressAsyncHandler(async (req, res) => {
  await userModel.findByIdAndUpdate(req.user._id, {
    $pull: {
      wishlist: { item: req.params.id },
    },
  });
  res.status(200).json({ massage: "Item remove from Wishlist" });
});

// get is Item In Wishlist
const isItemInWishlist = expressAsyncHandler(async (req, res) => {
  const userExists = await userModel.findById(req.user._id);
  if (!userExists) {
    res.status(400);
    throw new Error("User not found");
  }
  const wishItem = await userExists.wishlist?.filter((elem) => {
    if (elem.item === req.params.id) {
      return elem;
    } else {
      return null;
    }
  });
  // console.log(wishItem);
  if (wishItem[0]) {
    res.status(200).json(true);
  } else {
    res.status(200).json(false);
  }
});

// ################################################################

export { getItems, updateItem, removeItem, isItemInWishlist };
