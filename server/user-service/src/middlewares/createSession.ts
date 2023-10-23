import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

export default function createSession(req: Request, res: Response, next: NextFunction) {
   const { id, name, email, phone_number, cartItemsCount } = req.user;
   
   const expiresIn = req.path.includes("native") ? "7d" : "15m";
   jwt.sign(
      {
         id,
      },
      process.env.LOGIN_JWT_SESSION_SECRET as string,
      {
         expiresIn,
      },
      (err, token) => {
         if (err) {
            return next(err);
         }

         return res.status(200).json({
            sessionToken: token,
            name,
            email: email ? email : null,
            phone_number: phone_number ? phone_number : null,
            cartItemsCount,
         });
      });
}