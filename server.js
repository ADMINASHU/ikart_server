import express from "express";
import dotenv from "dotenv";
import dbConnect from "./config/dbConn.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import authRouter from "./router/authRoutes.js";
import productRouter from "./router/productRoutes.js";
import kartRouter from "./router/kartRoutes.js";
import sellerRouter from "./router/sellerRoutes.js";
import corsOption from "./config/corsOption.js";
import fileUpload from "express-fileupload";
import errorHandler from "./services/errorHandler.js";
import userRouter from "./router/userRoutes.js";


dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Connect DB
dbConnect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOption));


// cloudConfig
app.use(
  fileUpload({
    useTempFiles: true,
  })
);


// Routes
app.get("/", (req, res) => {
  res.send({ msg: "welcome on iKart server home page" });
});
// app.use("/public", express.static("public"));
app.use("/auth", authRouter);
app.use("/product", productRouter);
app.use("/kart", kartRouter);
app.use("/user", userRouter);
app.use("/seller", sellerRouter);

// errorHandler
app.use(errorHandler)

// running server
app.listen(port, () => console.log(`iKart server is running on port: ${port}`));
