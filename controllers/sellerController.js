import expressAsyncHandler from "express-async-handler";
import userModel from "../modules/userSchema.js";
import uploadImage from "../config/cloudinary.js";
import clearTempImage from "../services/clearTemp.js";

// update User
const sellerRegistration = expressAsyncHandler(async (req, res) => {
  const {
    email,
    organization,
    gstin,
    pan,
    mobile,
    pincode,
    locality,
    address,
    city,
    state,
    landmark,
    altMobile,
  } = req.body;
  if (
    !email &&
    !organization &&
    !gstin &&
    !pan &&
    !mobile &&
    !pincode &&
    !locality &&
    !address &&
    !city &&
    !state &&
    !landmark &&
    !altMobile
  ) {
    res.status(400);
    throw new Error("Please enter all required fields");
  }
  const user = await userModel.findById(req.user._id).select("-password");
  if (user) {
    const seller = user?.sellerInfo;
    const { logo } = seller;

    const file = req.files?.logo;
    if (file) {
      const uploadResult = await uploadImage(file, "Sellers");
      const uploadImageURL = uploadResult?.secure_url;
      seller.logo = uploadImageURL || logo;
      clearTempImage(file);
    }

    // get data
    seller.organization = req.body?.organization;
    seller.gstin = req.body?.gstin;
    seller.pan = req.body?.pan;
    seller.email = req.body?.email;
    seller.mobile = req.body?.mobile;
    seller.pincode = req.body?.pincode;
    seller.locality = req.body?.locality;
    seller.address = req.body?.address;
    seller.city = req.body?.city;
    seller.state = req.body?.state;
    seller.landmark = req.body?.landmark || "";
    seller.altMobile = req.body?.altMobile;

    // update in DB
    const saveSeller = await user.save();

    // send response to front-end
    if (saveSeller) {
      res.status(200).json({ massage: "Seller update successfully" });
    } else {
      res.status(400);
      throw new Error("Seller update failed");
    }
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

// update Seller
const updateSeller = expressAsyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user._id).select("-password");
  if (user) {
    const seller = user?.sellerInfo;
    const {
      email,
      organization,
      logo,
      gstin,
      pan,
      mobile,
      pincode,
      locality,
      address,
      city,
      state,
      landmark,
      altMobile,
    } = seller;

    const file = req.files?.logo;
    if (file) {
      const uploadResult = await uploadImage(file, "Sellers");
      const uploadImageURL = uploadResult?.secure_url;
      seller.logo = uploadImageURL || logo;
      clearTempImage(file);
    }

    // get data
    seller.organization = req.body?.organization || organization;
    seller.gstin = req.body?.gstin || gstin;
    seller.pan = req.body?.pan || pan;
    seller.email = req.body?.email || email;
    seller.mobile = req.body?.mobile || mobile;
    seller.pincode = req.body?.pincode || pincode;
    seller.locality = req.body?.locality || locality;
    seller.address = req.body?.address || address;
    seller.city = req.body?.city || city;
    seller.state = req.body?.state || state;
    seller.landmark = req.body?.landmark || "";
    seller.altMobile = req.body?.altMobile;

    // update in DB
    const saveSeller = await user.save();

    // send response to front-end
    if (saveSeller) {
      res.status(200).json({ massage: "Seller update successfully" });
    } else {
      res.status(400);
      throw new Error("Seller update failed");
    }
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

export { sellerRegistration, updateSeller };
