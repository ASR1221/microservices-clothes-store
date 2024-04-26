import express from "express";;

import { makeOrder, getOrder, getOrderDetails, completePayment, healthCheck } from "../controllers/orderController";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/make", authMiddleware, makeOrder);

router.get("/list", authMiddleware, getOrder);

router.get("/details/:id", authMiddleware, getOrderDetails);

router.get("/payment/complete", authMiddleware, completePayment);

router.get("/health", healthCheck);

export default router;
