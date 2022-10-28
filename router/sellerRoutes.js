import express from "express";
const sellerRouter = express.Router();
import userModel from "../modules/userSchema.js";
import verifyToken from "../services/jwtVerify.js";

sellerRouter.post("/registration", verifyToken, async (req, res) => {
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

export default sellerRouter;
