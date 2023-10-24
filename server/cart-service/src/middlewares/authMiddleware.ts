import { NextFunction, Request, Response } from "express";

import dotenv from "dotenv";

import CustomError from "../types/customError";

if (process.env.NODE_ENV !== "production") {
   dotenv.config();
}

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
   try {
      const authResponse = await fetch(`${process.env.USER_SERVICE_URL}/auth/check`);

      if (!authResponse.ok) {
         const error = new Error("users-service response error. Check users-service and repeat this request.") as CustomError;
         error.status = 500;
         return next(error);
      }

      req.user = await authResponse.json();

      return next();
   } catch (e) {
      return next(e);
   }
}