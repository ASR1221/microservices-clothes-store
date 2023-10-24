import { addToCart, listCartItems, updateCartItem, removeFromCart } from "../controllers/cartController";
import authMiddleware from "../middlewares/authMiddleware";

const router = require("express").Router();

router.post("/add", authMiddleware, addToCart);

router.get("/list", authMiddleware, listCartItems);

router.put("/update", authMiddleware, updateCartItem);

router.delete("/remove/:id", authMiddleware, removeFromCart);

export default router;