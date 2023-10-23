import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import CustomError from "../types/customError";

export default function checkAndRecreateSession(req: Request, next: NextFunction) {

   if (!req.headers.authorization) {
      const error = new Error("No session token. Please try logging in") as CustomError;
      error.status = 401;
      return next(error);
   }

   try {
      const sessionToken = req.headers.authorization.split("Bearer ")[1];
      if (!sessionToken) {
         const error = new Error("No session token. Please try logging in") as CustomError;
         error.status = 401;
         return next(error);
      }
   
      jwt.verify(sessionToken, process.env.LOGIN_JWT_SESSION_SECRET as string, (err, payload) => {
   
         const data = payload as unknown as { id: string };
         
         if (err || (!data)) {
            const error = new Error("Unauthorized. sessionToken has either expired or altered.") as CustomError;
            error.status = 401;
            return next(error)
         }
   
         const expiresIn = req.path.includes("native") ? "7d" : "15m";
         jwt.sign(
            {
               id: data.id,
            },
            process.env.LOGIN_JWT_SESSION_SECRET as string,
            {
               expiresIn,
            },
            (error, token) => {
               if (error) {
                  return next(error);
               }
   
               req.user = {
                  user_id: data.id,
                  sessionToken: token,
               }
            });
      });
   } catch (e: any) {
      return next(e);
   }
   
}