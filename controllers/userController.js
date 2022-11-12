import expressAsyncHandler from "express-async-handler";
import userModel from "../modules/userSchema.js";
import bcrypt from "bcryptjs";
import uploadImage from "../config/cloudinary.js";
import clearTempImage from "../services/clearTemp.js";

// get User
const getUser = expressAsyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user._id).select("-password");
  if (user) {
    // Send response
    res.status(200).json(user);
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

// update User
const updateUser = expressAsyncHandler(async (req, res) => {
 

  const user = await userModel.findById(req.user._id).select("-password");
  if (user) {
    const { uname, email, role, image, gender } = user;

    const file = req.files?.image;
    if (file) {
      const uploadResult = await uploadImage(file, "Users");
      const uploadImageURL = uploadResult?.secure_url;
      user.image = uploadImageURL || image;
      clearTempImage(file);
    }

    user.email = email;
    user.uname = req.body?.uname || uname;
    user.gender = req.body?.gender || gender;
    user.role = role;
    

    // update in DB
    const updateUser = await user.save();

    // send response to front-end
    if (updateUser) {
      res.status(200).json({ massage: "User update successfully" });
    } else {
      res.status(400);
      throw new Error("User update failed");
    }
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

// update User Password
const updateUserPassword = expressAsyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user._id);
  if (user) {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res.status(400);
      throw new Error("Please fill all required fields");
    }
    if (oldPassword === newPassword) {
      res.status(400);
      throw new Error("Please fill new Password different from old Password");
    }
    // Match password
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      res.status(400);
      throw new Error("Old Password Not matched");
    }
    user.password = newPassword || password;

    // update in DB
    const response = await user.save();
    // Send response
    if (response) {
      res.status(200).json({ massage: "Password update successfully" });
    } else {
      res.status(400);
      throw new Error("Password update failed");
    }
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

// delete User
const deleteUser = expressAsyncHandler(async (req, res) => {
  const response = await userModel.findByIdAndDelete(req.user._id);
  if (response) {
    res
      .status(200)
      .cookie("jwtToken", "", {
        path: "/",
        httpOnly: true,
        maxAge: 0,
        // sameSite: "none",
        // secure : true,
      })
      .json({ Message: "User deleted successfully" });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

export { getUser, updateUser, updateUserPassword, deleteUser };
