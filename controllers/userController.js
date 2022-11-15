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
    const { uname, lname, email, role, image, gender } = user;

    const file = req.files?.image;
    if (file) {
      const uploadResult = await uploadImage(file, "Users");
      const uploadImageURL = uploadResult?.secure_url;
      user.image = uploadImageURL || image;
      clearTempImage(file);
    }

    user.email = email;
    user.uname = req.body?.uname || uname;
    user.lname = req.body?.lname || lname;
    user.gender = req.body?.gender || gender;
    user.role = role;

    // update in DB
    const saveUser = await user.save();

    // send response to front-end
    if (saveUser) {
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

// update User Address
const updateUserAddress = expressAsyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user._id).select("-password");
  if (user) {
    const { name, mobile, pincode, locality, address, city, state, landmark, altMobile, addType } =
      user;

    user.name = req.body?.name || name;
    user.mobile = req.body?.mobile || mobile;
    user.pincode = req.body?.pincode || pincode;
    user.locality = req.body?.locality || locality;
    user.address = req.body?.address || address;
    user.city = req.body?.city || city;
    user.state = req.body?.state || state;
    user.landmark = req.body?.landmark || landmark;
    user.altMobile = req.body?.altMobile || altMobile;
    user.addType = req.body?.addType || addType;

    // update in DB
    const saveUser = await user.save();

    // send response to front-end
    if (saveUser) {
      res.status(200).json({ massage: "Address update successfully" });
    } else {
      res.status(400);
      throw new Error("Address update failed");
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

export { getUser, updateUser, updateUserAddress, updateUserPassword, deleteUser };
