import express from "express";
const router = express.Router();
import productModel from "./modules/productSchema.js";
import userModel from "./modules/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyToken from "./services/jwtVerify.js";

router.get("/", (req, res) => {
  res.send({ msg: "welcome on iKart server home page" });
});
// done 13
router.post("/signup", async (req, res) => {
  try {
    const { uname, email, password, cPassword, role } = req.body;
    if (!uname || !email || !password || !cPassword)
      return res
        .status(400)
        .json({ errorMassage: "Please enter all required fields" });
    if (password != cPassword)
      return res.status(400).json({
        errorMassage: "Confirm password does not match with password",
      });
    const userExist = await userModel.findOne({ uname: uname });
    if (userExist)
      return res
        .status(400)
        .json({ errorMassage: "Account with this Username has already exist" });
    const salt = await bcrypt.genSalt();
    const HashPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      uname: uname,
      email: email,
      password: HashPassword,
      role: role,
    });
    const saveUser = await newUser.save();

    const refreshToken = jwt.sign(
      { user: saveUser._id },
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: "1d" }
    );

    //save refreshToken in cookies
    res
      .cookie("jwt", refreshToken, {
        httpOnly: true,
        // sameSite: "none",
        maxAge: 15 * 60 * 1000,
      })
      .send();

    // res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "User registration failed" });
  }
});
// done 14
router.post("/signin", async (req, res) => {
  try {
    const { uname, password } = req.body;
    if (!uname || !password)
      return res
        .status(400)
        .json({ errorMassage: "Please enter all required fields" });
    const dbUser = await userModel.findOne({ uname: uname }).exec();
    if (!dbUser)
      return res.status(401).json({ errorMassage: "invalid credentials" });
    const matchPassword = await bcrypt.compare(password, dbUser.password);
    if (!matchPassword)
      return res.status(401).json({ errorMassage: "invalid credentials" });

    const refreshToken = jwt.sign(
      { user: dbUser._id },
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: "1h" }
    );
    // save token to DB

    await userModel.findByIdAndUpdate(
      { _id: dbUser._id },
      {
        $set: {
          token: refreshToken,
        },
      },
      {
        new: true,
        useFindAndModify: false,
      }
    );

    //save refreshToken in cookies
    res
      .cookie("jwt", refreshToken, {
        httpOnly: true,
        // sameSite: "none",
        maxAge: 1 * 60 * 60 * 1000,
      })
      .send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMassage: "User SignIn failed" });
  }
});
// done 12
router.post("/logout", (req, res) => {
  try {
    res
      .cookie("jwt", "", {
        httpOnly: true,
        // sameSite: "none",
        maxAge: 0,
      })
      .send();
    // console.log("log out");
  } catch (error) {
    console.log(error);
  }
});
// done 15
router.get("/loggedIn", async (req, res) => {
  try {
    const token = req.cookies.jwt;
    // console.log(token);
    if (!token) return res.send(false);
    const result = jwt.verify(token, process.env.REFRESH_SECRET_KEY);
    const { user } = result;
    // get user details
    const dbUser = await userModel.findOne({ _id: user }).exec();
    // create access token
    const accessToken = jwt.sign(
      { user: dbUser._id },
      process.env.ACCESS_SECRET_KEY,
      { expiresIn: "15m" }
    );
    //  send user data to front-end
    res.json({
      userId: dbUser._id,
      username: dbUser.uname,
      email: dbUser.email,
      role: dbUser.role,
      accessToken: accessToken,
      seller: dbUser.seller,
      cart: dbUser.cart,
    });

    // console.log("Log In");
  } catch (error) {
    console.log(error);
  }
});
// done 8
router.put("/addCart/:id", verifyToken, async (req, res) => {
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
// done 9
router.put("/removeCart/:id", verifyToken, async (req, res) => {
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
// not in use ##################################
router.put("/updateCart/:id", verifyToken, async (req, res) => {
  try {
    const { userId, count } = req.body;
    if (!userId) return res.status(400);
    // console.log(userId);
    await userModel.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          cart: { item: req.params.id, count: count },
        },
      },
      {
        new: false,
        useFindAndModify: true,
      }
    );
    res.status(200).json({ massage: "Product updated" });
  } catch (error) {
    console.log(error);
  }
});
// done 10
router.get("/getCart/:uid", verifyToken, async (req, res) => {
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
// done 11
router.get("/getCount/:uid/:id", verifyToken, async (req, res) => {
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
//done 7
router.get("/product", async (req, res) => {
  try {
    const dbProduct = await productModel.find();
    res.status(200).send(dbProduct);
  } catch (error) {
    console.log(error);
  }
});
//  not use ####################################
router.get("/product/:num", async (req, res) => {
  try {
    const dbProduct = await productModel.find().limit(req.params.num);
    res.status(200).send(dbProduct);
  } catch (error) {
    console.log(error);
  }
});
// done 6
router.get("/getProduct/:uid", verifyToken, async (req, res) => {
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
// done 5
router.delete("/deleteProduct/:id", verifyToken, async (req, res) => {
  try {
    const deleteProduct = await productModel.deleteOne({ _id: req.params.id });
    res.status(200).send(deleteProduct);
  } catch (error) {
    console.log(error);
  }
});
// done 4
router.put("/updateProduct/:id", verifyToken, async (req, res) => {
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
// done 3
router.get("/gProduct/:id", verifyToken, async (req, res) => {
  try {
    const getProduct = await productModel.findOne({ _id: req.params.id });
    res.status(200).send(getProduct);
  } catch (error) {
    console.log(error);
  }
});
// done 2
router.get("/searchProduct/:key", async (req, res) => {
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
// done 1
router.post("/addProduct", verifyToken, async (req, res) => {
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
// done 16
router.post("/seller", verifyToken, async (req, res) => {
  try {
    const { uname, role, gstin, line1, line2, line3, city, state, pincode } =
      req.body;
    const dbUser = await userModel.findOne({ uname: uname });
    // console.log(dbUser);
    const updateUser = async (id) => {
      try {
        await userModel.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              role: role,
              seller: {
                gstin: gstin,
                address: {
                  line1: line1,
                  line2: line2,
                  line3: line3,
                  city: city,
                  state: state,
                  pincode: pincode,
                },
              },
            },
          },
          {
            new: true,
            useFindAndModify: false,
          }
        );

        // send user data to front-end
        res.status(200).json({
          role: role,
          seller: {
            gstin: gstin,
            address: {
              line1: line1,
              line2: line2,
              line3: line3,
              city: city,
              state: state,
              pincode: pincode,
            },
          },
        });
      } catch (error) {
        console.log(error);
      }
    };

    await updateUser(dbUser._id);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Seller registration failed" });
  }
});

export default router;
