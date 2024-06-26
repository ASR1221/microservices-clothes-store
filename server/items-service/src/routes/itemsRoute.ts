import express from "express";

import { listItems, itemDetails, searchItem, checkAvailable, decrementStock, healthCheck } from "../controllers/itemsController";

const router = express.Router();

router.get("/list", listItems); // must send query params like => /list?section=men&type=jeans  //* type is optional

router.get("/details/:id",itemDetails);

router.get("/search", searchItem); // query string ?term=

router.get("/detail/available", checkAvailable); // query string ?item_details_id=${item.item_details_id}&item_count=${item.item_count} //* item_count is optional

router.patch("/stock/decrement", decrementStock);

router.get("/health", healthCheck);

export default router;