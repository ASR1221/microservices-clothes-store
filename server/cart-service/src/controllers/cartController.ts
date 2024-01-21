import { NextFunction, Request, Response } from "express";

import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
   dotenv.config();
}

import Cart from "../models/cartModel";
import CustomError from "../types/customError";

export async function addToCart(req: Request, res: Response, next: NextFunction) {
   const items = req.body as any[];
   const { user_id, sessionToken } = req.user;

   try {

      if (!items.length) {
         const error = new Error("No Items in the body") as CustomError;
         error.status = 400;
         return next(error);
      }

      items.forEach(item => {
         if (!(item.item_details_id && item.item_count)) {
            const error = Error("Missing Information. Please try again.") as CustomError;
            error.status = 400;
            return next(error);
         }
         if (item.item_count < 1) {
            const error = new Error("item_count for all items has to be bigger than 0.") as CustomError;
            error.status = 400;
            return next(error);
         }
      });

   } catch (e) {
      return next(e);
   }

   try {
      const promises: Promise<any>[] = [];
      items.forEach(item => {
         const itemAvalResponse = fetch(`${process.env.ITEM_SERVICE_URL}/detail/available?item_details_id=${item.item_details_id}&item_count=${item.item_count}`);

         promises.push(itemAvalResponse);
      });


      const itemsTemp = await Promise.all(promises);
      const promises2: Promise<any>[] = [];

      itemsTemp.forEach(item => {
         if (!item.ok) {
            const error = new Error(`items-service response error: ${item.statusText}`) as CustomError;
            error.status = item.status;
            return next(error);
         }
         const jsonReady = item.json();
         promises2.push(jsonReady);
      });
      const pricesArr = await Promise.all(promises2);

      if (pricesArr.length < 1) throw new Error("The specified item_count is larger than what is available of the item.");

      const cartItems = pricesArr.map(priceObj => {
         let total_price = 0;
         let item_count = 0;
         items.forEach(item => {
            if (item.item_details_id === priceObj.itemDetailsId) {
               total_price = +priceObj.price * item.item_count;
               item_count = item.item_count;
            }
         });
         if (!total_price) return;

         return {
            user_id,
            item_details_id: priceObj.itemDetailsId,
            item_count,
            total_price,
         };
      }) as any[];

      await Cart.bulkCreate(cartItems);
      return res.status(200).json({
         sessionToken,
         message: "cart item added"
      });

   } catch (e) {
      return next(e);
   }
}

export async function listCartItems(req: Request, res: Response, next: NextFunction) {
   const { user_id } = req.user;

   try {
      const cartItemsTemp = await Cart.findAll({
         where: { user_id },
         attributes: { exclude: ["user_id", "createdAt", "updatedAt"] },
      }) as any;

      const promises: Promise<any>[] = [];
      cartItemsTemp.forEach((item: any) => {
         const itemAvalResponse = fetch(`${process.env.ITEM_SERVICE_URL}/detail/available?item_details_id=${item.item_details_id}`);

         promises.push(itemAvalResponse);
      });


      const itemsTemp = await Promise.all(promises);
      const promises2: Promise<any>[] = [];

      itemsTemp.forEach(item => {
         if (!item.ok) {
            const error = new Error(`items-service response error: ${item.statusText}`) as CustomError;
            error.status = item.status;
            return next(error);
         }

         const jsonReady = item.json();
         promises2.push(jsonReady);
      });
      const itemsTemp2 = await Promise.all(promises2);

      const cartItems = cartItemsTemp.map((item: any) => ({
         ...item.dataValues,
         ...itemsTemp2.find(d => d.itemDetailsId === item.item_details_id) ?? null,
      }));

      return res.status(200).json(cartItems);

   } catch (e) {
      return next(e);
   }
}

export async function updateCartItem(req: Request, res: Response, next: NextFunction) {
   const { id, item_details_id, item_count } = req.body;

   if (!(id && item_details_id && (item_count && item_count > 0))) {
      const error = new Error("Missing Information. Please try again.") as CustomError;
      error.status = 400;
      return next(error);
   }

   try {

      const itemAvalResponse = await fetch(`${process.env.ITEM_SERVICE_URL}/detail/available?item_details_id=${item_details_id}&item_count=${item_count}`);
      
      if (!itemAvalResponse.ok) {
         const error = new Error(`items-service response error: ${itemAvalResponse.statusText}`) as CustomError;
         error.status = itemAvalResponse.status;
         return next(error);
      }

      const item = await itemAvalResponse.json();

      if (!item) {
         const error = new Error("Sorry, we don't have this amount of the item.") as CustomError;
         error.status = 400;
         return next(error);
      }

      const total_price = parseFloat(item.price) * item_count;

      const newCartItem = await Cart.update(
         { 
            item_details_id,
            item_count,
            total_price,
         },
         {
            where: { id },
         }
      );

      if (!(newCartItem[0] > 0)) {
         const error = new Error("Sorry, we could not find this cart item.") as CustomError;
         error.status = 404;
         return next(error);
      }
      
      return res.status(200).json({
         message: "updated successfully",
         sessionToken: req.user.sessionToken,
      });
      
   } catch (e) {
      return next(e)
   }
}

export async function removeFromCart(req: Request, res: Response, next: NextFunction) {
   try {
      const result = await Cart.destroy({ where: { id: req.params.id } })
      if (!result) { 
         const error = new Error("Item not found.") as CustomError;
         error.status = 404;
         return next(error);
      }
      
      return res.status(200).json({
         message: "Cart item deleted",
         sessionToken: req.user.sessionToken,
      });
      
   } catch (e) {
      return next(e);
   }
}


// removeAll for order-service usage   //* when a user makes an order, all cart items are removd
export async function removeAll(req: Request, res: Response, next: NextFunction) {

   try {
      await Cart.destroy({ where: { user_id: req.user.user_id } });
   } catch (e) {
      return next(e);
   }
} 