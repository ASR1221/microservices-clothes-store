import { NextFunction, Request, Response } from "express";
import express from "express";

import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import logger from "morgan";
import sequelizeDB from "./utils/database";

import router from "./routes/itemsRoute";

// import Items from "./models/itemsModel";
// import ItemsDetails from "./models/itemsDetailsModel";
// import ItemsImages from "./models/imagesModel";

const app = express();

// Development imports
if (process.env.NODE_ENV !== "production") {
   dotenv.config();
   app.use(logger("dev"));
}

// Important middlewares
app.use(helmet());
app.use(helmet.hidePoweredBy());
app.use(compression());
app.use(express.json());
app.use(express.static("public"));

// database sync (should import model to work) //! DELETE after sync is complete
// sequelizeDB.sync({ alter: true})
//    .then(() => console.log("database syncd"))
//    .catch((e: any) => console.log(`database sync error: ${e}`));

// routes
app.use("/api/items", router);

// Handling 404 (Not found)
app.use((req: Request, res: Response, next: NextFunction) => {
   res.status(404).json({ message: "Route not found." });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => res.status(err.status || 500).json({ message: err.message }));

app.listen(process.env.ITEM_SERVICE_PORT || 3000);