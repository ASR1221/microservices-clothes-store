import express from "express";

import { listServedItems, listPendingItems, addNewItem, updateStock, healthCheck } from "../controllers/adminsController";
import authMiddleware from "../middlewares/authMiddleware";
import checkRoleMiddleware from "../middlewares/checkRoleMiddleware";
import upload from "../middlewares/fileHandler";

const router = express.Router();

router.get("/list/served", authMiddleware, checkRoleMiddleware, listServedItems); // query string ?from&to&section&type

router.get("/list/pending", authMiddleware, checkRoleMiddleware, listPendingItems); // query string ?country&city

router.post("/item/add", authMiddleware, checkRoleMiddleware, upload, addNewItem);

router.put("/item/update", authMiddleware, checkRoleMiddleware, updateStock);

router.get("/health", healthCheck);

export default router;