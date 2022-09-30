import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT || 4000;
import connection from "./dbConn.js";
connection();
import router from "./router.js";
app.use(router);

app.listen(port, () => console.log(`iKart server running on port: ${port}`));
