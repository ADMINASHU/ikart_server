import mongoose from "mongoose";
import bcrypt from "bcryptjs";
//user schema
const userSchema = new mongoose.Schema({
  uname: {
    type: String,
    match: [/^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/, "Please enter a valid username"],
    required: [true, "Please add a username"],
  },
  lname: {
    type: String,
    match: [/^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/, "Please enter a valid username"],
  },
  name: {
    type: String,
  },
  gender: {
    type: String,
    match: [/^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/, "Please enter a valid gender"],
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    required: [true, "Please add a email"],
  },
  mobile: {
    type: Number,
  },
  altMobile: {
    type: Number,
  },
  pincode: {
    type: Number,
  },
  locality: {
    type: String,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  landmark: {
    type: String,
  },
  addType: {
    type: String,
  },

  role: {
    type: String,
    default: "User",
  },

  password: {
    type: String,
    required: [true, "Please add a password"],
  },

  token: String,
  image: {
    type: String,
    default: "https://res.cloudinary.com/dc1zhz2bg/image/upload/v1667140385/Users/user_xv7hft.png",
  },
  sellerInfo: {
    logo: {
      type: String,
      default:
        "https://res.cloudinary.com/dc1zhz2bg/image/upload/v1668523980/Sellers/org-logo_hoxmvt.png",
    },
    organization: {
      type: String,
    },
    gstin: {
      type: String,
    },
    pan: {
      type: String,
    },
    email: {
      type: String,
    },
    mobile: { type: Number },
    pincode: { type: Number },
    locality: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    landmark: {
      type: String,
    },
    altMobile: { type: Number },
  },
  seller: {
    gstin: String,
    address: {
      line1: String,
      line2: String,
      line3: String,
      city: String,
      state: String,
      pincode: Number,
    },
  },
  cart: [
    {
      item: String,
      count: Number,
    },
  ],
  wishlist: [
    {
      item: String,
    },
  ],
});

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  const HashPassword = await bcrypt.hash(this.password, salt);
  this.password = HashPassword;
  next();
});

const userModel = new mongoose.model("users", userSchema);

export default userModel;
