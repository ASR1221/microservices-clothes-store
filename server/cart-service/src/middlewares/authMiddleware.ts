import { NextFunction, Request, Response } from "express";

import dotenv from "dotenv";

import CustomError from "../types/customError";

if (process.env.NODE_ENV !== "production") {
   dotenv.config();
}

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {

   if (!req.headers.authorization) {
      const error = new Error("No Authorization header") as CustomError;
      error.status = 401;
      return next(error);
   }

   try {
      const authResponse = await fetch(`${process.env.USER_SERVICE_URL}/auth/check`, {
         headers: {
            "Authorization": req.headers.authorization,
         }
      });

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