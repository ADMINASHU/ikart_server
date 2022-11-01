import express from "express";
import { sellerRegistration } from "../controllers/sellerController.js";
const sellerRouter = express.Router();
import verifyAuth from "../services/verifyAuth.js";

sellerRouter.post("/registration", verifyAuth, sellerRegistration);

export default sellerRouter;
