import express from "express";
const authRouter = express.Router();
import userModel from "../modules/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

authRouter.post("/signup", async (req, res) => {
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

authRouter.post("/signin", async (req, res) => {
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

authRouter.get("/loggedIn", async (req, res) => {
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

authRouter.post("/logout", (req, res) => {
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


export default authRouter;
