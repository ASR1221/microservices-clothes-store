import { NextFunction, Request, Response } from "express";

import dotenv from "dotenv";

import CustomError from "../types/customError";
import Admins from "../models/adminsModel";

if (process.env.NODE_ENV !== "production") {
   dotenv.config();
}

export default async function CheckRole(req: Request, res: Response, next: NextFunction) {

   const { user_id } = req.user;

   try {
      const admins = await Admins.findAll({ where: { user_id } });
      
      if (admins.length < 1) {
         const error = new Error("You are not allowed to visit this route.") as CustomError;
         error.status = 401;
         return next(error);
      }
   
      const roles = admins.map((admin: any) => admin.role);
      req.user.roles = roles;

      return next();
   } catch (e) {
      return next(e);
   }
}