import express from "express";
import dotenv from "dotenv";
import "./services/dbConn.js";
import router from "./router.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./router/authRoutes.js";
import productRouter from "./router/productRoutes.js";
import kartRouter from "./router/kartRoutes.js";
import sellerRouter from "./router/sellerRoutes.js";
import corsOption from "./config/corsOption.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOption));
// app.use(router);
app.get("/", (req, res) => {
    res.send({ msg: "welcome on iKart server home page" });
  });
app.use("/auth", authRouter);
app.use("/product", productRouter);
app.use("/kart", kartRouter);
app.use("/seller", sellerRouter);

app.listen(port, () => console.log(`iKart server is running on port: ${port}`));
