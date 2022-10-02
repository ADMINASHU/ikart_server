import express from "express";
const router = express.Router();
import productModel from "./productSchema.js";
import userModel from "./userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

router.get("/", (req, res) => {
  res.send({ msg: "welcome on iKart server home page" });
});

router.get("/product", async (req, res) => {
  try {
    const dbProduct = await productModel.find();
    res.status(200).send(dbProduct);
  } catch (error) {
    console.log(error);
  }
});

router.post("/product", async (req, res) => {
  try {
    const result = req.body;
    const dbProduct = new productModel(result);
    const saveResult = await dbProduct.save();
    res.status(201).send(saveResult);
  } catch (error) {
    console.log(error);
  }
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

router.post("/seller", async (req, res) => {
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
