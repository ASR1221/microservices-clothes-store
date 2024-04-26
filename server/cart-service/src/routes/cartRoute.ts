import express from "express";

import { addToCart, listCartItems, updateCartItem, removeFromCart, removeAll, healthCheck } from "../controllers/cartController";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/add", authMiddleware, addToCart);

router.get("/list", authMiddleware, listCartItems);

router.put("/update", authMiddleware, updateCartItem);

router.delete("/remove/:id", authMiddleware, removeFromCart);

router.delete("/remove", authMiddleware, removeAll);

router.get("/health", healthCheck);

export default router;