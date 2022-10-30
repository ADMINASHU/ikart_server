import expressAsyncHandler from "express-async-handler";
import userModel from "../modules/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = expressAsyncHandler(async (req, res) => {
  const { uname, email, password, cPassword, role } = req.body;
  if (!uname || !email || !password || !cPassword) {
    res.status(400);
    throw new Error("Please enter all required fields");
  }
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
});

export { registerUser };
