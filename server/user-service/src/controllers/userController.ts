import { NextFunction, Request, Response } from "express";

import { Op } from "sequelize";
import dotenv from "dotenv";

import Users from "../models/usersModel";
import Admins from "../models/adminsModel";
import countries from "../constants/countries";
import CustomError from "../types/customError";
import checkAndRecreateSession from "../utils/checkAndRecreateSession";

if (process.env.NODE_ENV !== "production") {
   dotenv.config();
}

export async function googleUser(req: Request<{}, {}, { access_token: string }>, res: Response, next: NextFunction) {

   const { access_token } = req.body;

   if (!access_token) {
      const error = new Error("Missing Information. Please try again.") as CustomError;
      error.status = 400;
      return next(error);
   }

   try {
      const response = await fetch(`https://people.googleapis.com/v1/people/me?personFields=emailAddresses,names&access_token=${access_token}`);
      const { names, emailAddresses } = await response.json();

      const name = names[0].displayName;
      const email = emailAddresses[0].value;
      const email_verified = emailAddresses[0].metadata.verified;

      if (!(response.ok && email_verified && email && name)) {
         const error = new Error("There was a problem getting your data. Please try again.") as CustomError;
         error.status = 500;
         return next(error);
      }

      if (!email_verified) {
         const error = new Error("Email is not verified. Please use a verified email.") as CustomError;
         error.status = 401;
         return next(error);
      }

      const [user, created] = await Users.findOrCreate({
         where: { email },
         attributes: { exclude: ["createdAt", "updatedAt"]},
         defaults: {
            name,
            email,
         }
      }) as any;
      
      const cartResponse = await fetch(`${process.env.CART_SERVICE_URL}/list`, {
         headers: {
            "Authorization": req.headers.authorization,
         }
      } as any);

      req.user = {
         id: user.id,
         name: user.name,
         email,
      }

      return next();

   } catch (err) {
      return next(err);
   }
}


export async function facebookUser(req: Request, res: Response, next: NextFunction) {

   const { access_token } = req.body
   if (!access_token) {
      const error = new Error("Missing Information. Please try again.") as CustomError;
      error.status = 400;
      return next(error);
   }

   try {
      const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${access_token}`);
      // should add phone_number to the fields above but it requires advance permissions. and also add phone number to the scopes in the request url in the client side.
      const { name, email, phone_number } = await response.json(); 

      if (!(response.ok && (email || phone_number) && name)) {
         const error = new Error("There was a problem getting your data. Please try again.") as CustomError;
         error.status = 500;
         return next(error);
      }
      
      const [user, created] = await Users.findOrCreate({
         where: {
            [Op.or]: {
               email: email || null, 
               phone_number: phone_number || "12",
            }
         },
         defaults: {
            name,
            email: email || null,
            phone_number: phone_number || null,
         }
      }) as any;

      req.user = {
         id: user.id,
         name: user.name,
         email,
      }
      return next();

   } catch (e) {
      return next(e);
   }
}

export function setUserInfo(req: Request, res: Response, next: NextFunction) {
   const { country, city, district, nearestPoI, phone_number } = req.body;

   if (!(district && nearestPoI && phone_number)) {
      const error = new Error("Missing Information. Please try again.") as CustomError;
      error.status = 400;
      return next(error);
   }

   if (!(phone_number.length > 10 && Number(phone_number))) {
      const error = new Error("phone_number field is not a phone number.") as CustomError;
      error.status = 400;
      return next(error);
   }
   
   if (!(countries.some(location => location.country === country && location.cities.includes(city)))) {
      const error = new Error("We can't reach this location yet") as CustomError;
      error.status = 400;
      return next(error);
   }

   Users.update({
      country,
      city,
      district,
      nearestPoI,
      phone_number,
   }, {
      where: {
         id: req.user.user_id
      }
   })
      .then(() => res.status(200).json({ message: "Location and phone number saved", sessionToken: req.user.sessionToken }))
      .catch((e: any) => next(e));
}

export async function getUserInfo(req: Request, res: Response, next: NextFunction) {
   
   try {
      const user = await Users.findByPk(req.user.user_id, {
         attributes: { exclude: ["id"] },
      });

      res.status(200).json(user);
   } catch (e) {
      return next(e);
   }
}

export async function checkUser(req: Request, res: Response, next: NextFunction) {
   await checkAndRecreateSession(req, next);

   res.status(200).json(req.user);
}

export async function checkRole(req: Request, res: Response, next: NextFunction) {
   const { user_id } = req.user;

   try {
      const admins = await Admins.findAll({ where: { user_id } }) as any[];
      
      if (admins.length < 1) {
         const error = new Error("You are not allowed to visit this route.") as CustomError;
         error.status = 401;
         return next(error);
      }
   
      const roles = admins.map(admin => admin.role);
      
      return res.status(200).json({
         sessionToken: req.user.sessionToken,
         roles,
      });

   } catch (e) {
      return next(e);
   }
}

export function healthCheck(req: Request, res: Response, next: NextFunction) {
   return res.status(200).json({ message: "good" });
}