import express from "express";
import { sellerRegistration, updateSeller } from "../controllers/sellerController.js";
const sellerRouter = express.Router();
import verifyAuth from "../services/verifyAuth.js";

sellerRouter.patch("/registration", verifyAuth, sellerRegistration);
sellerRouter.patch("/updateSeller", verifyAuth, updateSeller);

export default sellerRouter;
