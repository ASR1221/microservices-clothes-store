import { NextFunction, Request, Response } from "express";
import checkAndRecreateSession from "../utils/checkAndRecreateSession";

export default async function checkAndRecreateSessionMiddleware(req: Request, res: Response, next: NextFunction) {
   await checkAndRecreateSession(req, next);

   return next();
}