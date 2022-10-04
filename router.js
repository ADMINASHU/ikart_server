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
  const { uname, email, password, cPassword, role } = req.body;
  if (!uname || !email || !password || !cPassword)
    return res.status(400).json({ error: "please fill all field" });
  if (password != cPassword)
    return res.status(412).json({ error: "Confirm password not matched" });
  try {
    const userExist = await userModel.findOne({ uname: uname });
    if (userExist) return res.status(409).json({ error: "User already exist" });
    const user = new userModel({
      uname,
      email,
      password,
      role,
    });
    await user.save();
    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "User registration failed" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { uname, password } = req.body;
    if (!uname || !password)
      return res.status(400).json({ error: "Please fill all field" });
    const dbUser = await userModel.findOne({ uname: uname });
    if (!dbUser) return res.status(401).json({ error: "invalid credentials" });
    const isMatch = await bcrypt.compare(password, dbUser.password);
    if (isMatch) {
      // create jwt
      const accessToken = jwt.sign(
        { username: dbUser.uname },
        process.env.ACCESS_SECRET_KEY,
        { expiresIn: "10m" }
      );
      const refreshToken = jwt.sign(
        { username: dbUser.uname },
        process.env.REFRESH_SECRET_KEY,
        { expiresIn: "1d" }
      );
      // save token to DB
      const updateUser = async (id) => {
        try {
          await userModel.findByIdAndUpdate(
            { _id: id },
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
        } catch (error) {
          console.log(error);
        }
      };
      await updateUser(dbUser._id);

      //save refreshToken in cookies
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });

      // send user data to front-end
      res.status(200).json({
        username: dbUser.uname,
        email: dbUser.email,
        role: dbUser.role,
        accessToken: accessToken,
        seller: dbUser.seller,
      });
    } else {
      res.status(401).json({ error: "invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "User SignIn failed" });
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
