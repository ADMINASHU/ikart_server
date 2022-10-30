import expressAsyncHandler from "express-async-handler";
import userModel from "../modules/userSchema.js";
import bcrypt from "bcryptjs";
import generateToken from "../services/generateToken.js";
import jwt from "jsonwebtoken";

// register User
const registerUser = expressAsyncHandler(async (req, res) => {
  const { uname, email, password, cPassword } = req.body;

  // Validation check
  if (!uname || !email || !password || !cPassword) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters");
  }
  if (password != cPassword) {
    res.status(400);
    throw new Error("Confirm password does not match with password");
  }

  // Check if user email already exists
  const userExists = await userModel.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Account with this Email has already exists");
  }

  // Create new user
  const newUser = await userModel.create({
    uname,
    email,
    password,
  });

  if (newUser) {
    const { _id, uname, email, role, image, cart } = newUser;

    // generate Token
    const token = generateToken(_id);

    // Send response and Cookie
    res
      .status(201)
      .cookie("jwtToken", token, {
        path: "/",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        // sameSite: "none",
        // secure : true,
      })
      .json({
        _id,
        uname,
        email,
        role,
        image,
        cart,
      });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// login User
const loginUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation check
  if (!email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // Check User Exists
  const userExists = await userModel.findOne({ email }).exec();
  if (!userExists) {
    res.status(400);
    throw new Error("invalid credentials");
  }

  // Match password
  const isPasswordMatch = await bcrypt.compare(password, userExists.password);
  if (!isPasswordMatch) {
    res.status(400);
    throw new Error("invalid credentials");
  }

  if (userExists && isPasswordMatch) {
    const { _id, uname, email, role, image, cart } = userExists;

    // generate Token
    const token = generateToken(_id);

    // Send response and Cookie
    res
      .status(201)
      .cookie("jwtToken", token, {
        path: "/",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        // sameSite: "none",
        // secure : true,
      })
      .json({
        _id,
        uname,
        email,
        role,
        image,
        cart,
      });
  } else {
    res.status(400);
    throw new Error("invalid credentials");
  }
});

// logout User
const logoutUser = expressAsyncHandler(async (req, res) => {
  // send Expire cookie
  res
    .status(200)
    .cookie("jwtToken", "", {
      path: "/",
      httpOnly: true,
      maxAge: 0,
      // sameSite: "none",
      // secure : true,
    })
    .json({ Message: "Successfully Logout " });
});

// get isLoggedIn
const isLoggedIn = expressAsyncHandler(async (req, res) => {
  const token = req.cookies.jwtToken;
  if (!token) return res.json(false);

  // verify Token
  const verified = await jwt.verify(token, process.env.REFRESH_SECRET_KEY);
  return res.json(verified ? true : false);
});

export { registerUser, loginUser, logoutUser, isLoggedIn };
