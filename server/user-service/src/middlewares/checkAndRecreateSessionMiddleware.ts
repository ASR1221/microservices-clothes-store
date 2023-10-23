import { NextFunction, Request, Response } from "express";
import checkAndRecreateSession from "../utils/checkAndRecreateSession";

export default function checkAndRecreateSessionMiddleware(req: Request, res: Response, next: NextFunction) {
   checkAndRecreateSession(req, next);

   return next();
}