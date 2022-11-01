import expressAsyncHandler from "express-async-handler";
import userModel from "../modules/userSchema.js";


// update User
const sellerRegistration = expressAsyncHandler(async (req, res) => {
  const { gstin, line1, line2, line3, city, state, pincode } = req.body;
  // Validation check
  if (!gstin || !line1 || !line2 || !line3 || !city || !state || !pincode) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  const response = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        role: "Seller",
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

  // send response to front-end
  if (response) {
    res.status(200).json({ massage: "seller registration successfully" });
  } else {
    res.status(400);
    throw new Error("seller registration failed");
  }
});

export { sellerRegistration };
