import expressAsyncHandler from "express-async-handler";
import userModel from "../modules/userSchema.js";
import bcrypt from "bcryptjs";

// get User
const getUser = expressAsyncHandler(async (req, res) => {
  if (req.user) {
    const { _id, uname, email, role, image, cart } = req.user;

    // Send response
    res.status(200).json({
      _id,
      uname,
      email,
      role,
      image,
      cart,
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

// update User
const updateUser = expressAsyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user._id).select("-password");
  if (user) {
    const { uname, email, role, image } = user;

    user.email = email;
    user.uname = req.body.uname || uname;
    user.role = req.body.role || role;
    user.image = req.body.image || image;

    // update in DB
    const updateUser = await user.save();

    // Send response
    res.status(200).json({
      _id: updateUser._id,
      uname: updateUser.uname,
      email: updateUser.email,
      role: updateUser.role,
      image: updateUser.image,
      cart: updateUser.cart,
    });
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
    await user.save();
    // Send response
    res.status(200).json({
      Message: "Password update successfully",
    });
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
