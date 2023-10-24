import express from "express";;

import { makeOrder, getOrder, getOrderDetails } from "../controllers/orderController";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/make", authMiddleware, makeOrder);

router.get("/list", authMiddleware, getOrder);

router.get("/details/:id", authMiddleware, getOrderDetails);

export default router;
