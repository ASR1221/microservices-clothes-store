import { NextFunction, Request, Response } from "express";

import dotenv from "dotenv";

import CustomError from "../types/customError";

if (process.env.NODE_ENV !== "production") {
   dotenv.config();
}

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {

   const { user_id } = req.user;

   try {
      const roleResponse = await fetch(`${process.env.USER_SERVICE_URL}/auth/role`, {
         headers: {
            "Authorization": req.headers.authorization as string,
         }
      });

      if (!roleResponse.ok) {
         const error = new Error(`users-service response error: ${roleResponse.statusText}`) as CustomError;
         error.status = roleResponse.status;
         return next(error);
      }

      const roles = await roleResponse.json();
      req.user.roles = roles;

      return next();
   } catch (e) {
      return next(e);
   }
}