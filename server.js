import express from "express";
import dotenv from "dotenv";
import { dbConnect, dbClose } from "./dbConn.js";
import router from "./router.js";

const app = express();
dotenv.config();
const port = process.env.PORT || 4000;
// dbConnect();
// dbClose();
app.use(router);

app.listen(port, () => console.log(`iKart server is running on port: ${port}`));
