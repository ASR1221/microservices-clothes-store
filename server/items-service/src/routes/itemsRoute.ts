import { listItems, itemDetails, searchItem} from "../controllers/itemsController";

const router = require("express").Router();

router.get("/list", listItems); // must send query params like => /list?section=men&type=jeans  //* type is optional

router.get("/details/:id",itemDetails);

router.get("/search", searchItem); // query string ?term=

export default router;