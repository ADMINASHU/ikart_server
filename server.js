import express from "express";
import dotenv from "dotenv";
import dbConnect from "./dbConn.js";
import router from "./router.js";
import cors from "cors";
const whiteList = ["http://localhost:3000", "http://localhost:4000"];
const corsOption = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by cors"));
    }
  },
  optionsSuccessStatus: 200,
};


const app = express();
app.use(express.json());
app.use(cors(corsOption));
dotenv.config();
const port = process.env.PORT || 4000;
app.use(router);

app.listen(port, () => console.log(`iKart server is running on port: ${port}`));
