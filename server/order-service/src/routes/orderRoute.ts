import { makeOrder, getOrder, getOrderDetails } from "../controllers/orderController";
import authMiddleware from "../middlewares/authMiddleware";

const router = require("express").Router();

router.post("/make", authMiddleware, makeOrder);

router.get("/list", authMiddleware, getOrder);

router.get("/details/:id", authMiddleware, getOrderDetails);

export default router;
