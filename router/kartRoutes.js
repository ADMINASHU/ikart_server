import express from "express";
const kartRouter = express.Router();
import productModel from "../modules/productSchema.js";
import userModel from "../modules/userSchema.js";
import verifyToken from "../services/jwtVerify.js";

kartRouter.put("/addItem/:id", verifyToken, async (req, res) => {
  try {
    const { userId, count } = req.body;
    if (!userId) return res.status(400);
    // console.log(userId);
    const existUser = await userModel.findOne({ _id: userId });

    const existItem = existUser?.cart.filter((elem) => {
      if (elem.item === req.params.id) {
        return elem;
      } else {
        return null;
      }
    });

    // console.log("afaaggagagag", existItem);

    if (existItem?.length) {
      await userModel.findByIdAndUpdate(
        { _id: userId },
        {
          $pull: {
            cart: { item: req.params.id },
          },
        }
      );
      if (count > 0) {
        await userModel.findByIdAndUpdate(
          { _id: userId },
          {
            $push: {
              cart: { item: req.params.id, count: count },
            },
          }
        );
      } else {
        await userModel.findByIdAndUpdate(
          { _id: userId },
          {
            $pull: {
              cart: { item: req.params.id },
            },
          }
        );
      }
      res.status(201).json({ massage: "Product count is updated" });
    } else {
      await userModel.findByIdAndUpdate(
        { _id: userId },
        {
          $push: {
            cart: { item: req.params.id, count: count },
          },
        },
        {
          new: true,
          useFindAndModify: false,
        }
      );
      res.status(201).json({ massage: "Product added in Cart" });
    }
  } catch (error) {
    console.log(error);
  }
});

kartRouter.put("/removeItem/:id", verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400);
    // console.log(userId);
    await userModel.findByIdAndUpdate(
      { _id: userId },
      {
        $pull: {
          cart: { item: req.params.id },
        },
      }
    );
    res.status(200).json({ massage: "Product remove from Cart" });
  } catch (error) {
    console.log(error);
  }
});
// not in use
// kartRouter.put("/updateItem/:id", verifyToken, async (req, res) => {
//   try {
//     const { userId, count } = req.body;
//     if (!userId) return res.status(400);
//     // console.log(userId);
//     await userModel.findByIdAndUpdate(
//       { _id: userId },
//       {
//         $set: {
//           cart: { item: req.params.id, count: count },
//         },
//       },
//       {
//         new: false,
//         useFindAndModify: true,
//       }
//     );
//     res.status(200).json({ massage: "Product updated" });
//   } catch (error) {
//     console.log(error);
//   }
// });

kartRouter.get("/getItems/:uid", verifyToken, async (req, res) => {
  try {
    const dbUser = await userModel.findOne({ _id: req.params.uid });
    const dbProduct = await productModel.find({
      _id: { $in: dbUser.cart.map((item) => item.item) },
    });
    const product = dbProduct.map((prod) => {
      const cartItem = dbUser.cart.filter((cart) => {
        if (cart.item === prod._doc._id.toString()) {
          return cart;
        }
      });
      return {
        ...prod._doc,
        count: cartItem[0].count,
        price: prod._doc.productPrice * cartItem[0].count,
        discount: prod._doc.productDiscount * cartItem[0].count,
      };
    });

    const totalCartCount = product.reduce(
      (partialSum, elem) => partialSum + elem.count,
      0
    );
    // console.log(totalCartCount);
    const totalCartPrice = product.reduce(
      (partialSum, elem) => partialSum + elem.price,
      0
    );
    // console.log(totalCartPrice);
    const totalCartDiscount = product.reduce(
      (partialSum, elem) => partialSum + elem.discount,
      0
    );
    // console.log(totalCartDiscount);
    const cart = {
      items: product,
      tCount: totalCartCount,
      tPrice: totalCartPrice,
      tDiscount: totalCartDiscount,
    };
    res.status(200).json(cart);
  } catch (error) {
    console.log(error);
  }
});

kartRouter.get("/getItemCount/:uid/:id", verifyToken, async (req, res) => {
  try {
    const dbUser = await userModel.findOne({ _id: req.params.uid });
    const cart = await dbUser.cart;
    if (cart) {
      const cartItem = await cart?.filter((elem) => {
        if (elem.item === req.params.id) {
          return elem;
        }
      });

      res.status(200).json(cartItem[0]?.count);
    }
  } catch (error) {
    console.log(error);
  }
});

export default kartRouter;
