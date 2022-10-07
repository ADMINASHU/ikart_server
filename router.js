import express from "express";
const router = express.Router();
import productModel from "./productSchema.js";
import userModel from "./userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyToken from "./jwtVerify.js";

router.get("/", (req, res) => {
  res.send({ msg: "welcome on iKart server home page" });
});

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

router.post("/signin", async (req, res) => {
  try {
    const { uname, password } = req.body;
    if (!uname || !password)
      return res
        .status(400)
        .json({ errorMassage: "Please enter all required fields" });
    const dbUser = await userModel.findOne({ uname: uname });
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

router.get("/logout", (req, res) => {
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

router.get("/loggedIn", async (req, res) => {
  try {
    const token = req.cookies.jwt;
    // console.log(token);
    if (!token) return res.send(false);
    const result = jwt.verify(token, process.env.REFRESH_SECRET_KEY);
    const { user } = result;
    // get user details
    const dbUser = await userModel.findOne({ _id: user });
    // create access token
    const accessToken = jwt.sign(
      { user: dbUser._id },
      process.env.ACCESS_SECRET_KEY,
      { expiresIn: "15m" }
    );
    //  send user data to front-end
    res.json({
      username: dbUser.uname,
      email: dbUser.email,
      role: dbUser.role,
      accessToken: accessToken,
      seller: dbUser.seller,
    });

    // console.log("Log In");
  } catch (error) {
    console.log(error);
  }
});

// other routes *******************************************************************************************************************

router.get("/product", async (req, res) => {
  try {
    const dbProduct = await productModel.find();
    res.status(200).send(dbProduct);
  } catch (error) {
    console.log(error);
  }
});

router.get("/getProduct/:uid", verifyToken, async (req, res) => {
  try {
    // console.log("received", req.params.uid);
    const sellerProduct = await productModel.find({
      productSellers: req.params.uid,
    });
    res.status(200).send(sellerProduct);
  } catch (error) {
    console.log(error);
  }
});

router.delete("/deleteProduct/:id", verifyToken, async (req, res) => {
  try {
    const deleteProduct = await productModel.deleteOne({ _id: req.params.id });
    res.status(200).send(deleteProduct);
  } catch (error) {
    console.log(error);
  }
});

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

router.get("/gProduct/:id", verifyToken, async (req, res) => {
  try {
    const getProduct = await productModel.findOne({ _id: req.params.id });
    res.status(200).send(getProduct);
  } catch (error) {
    console.log(error);
  }
});
router.get("/searchProduct/:key", async (req, res) => {
  try {
    const getProduct = await productModel.find({
      $or: [
        { productName: { $regex: req.params.key } },
        { productCategory: { $regex: req.params.key } },
        { productCode: req.params.key },
      ],
    });
    res.status(200).send(getProduct);
  } catch (error) {
    console.log(error);
  }
});

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
  } = req.body;
  if (
    !productName ||
    !productPrice ||
    !productQuantity ||
    !productCategory ||
    !productImage ||
    !productColor ||
    !productCode ||
    !sellerName
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
    });
    await product.save();
    res.status(201).json({ msg: "Product added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Adding Product failed" });
  }
});

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
