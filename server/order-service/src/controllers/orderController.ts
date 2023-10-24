import { NextFunction, Request, Response } from "express";

import OrderItems from "../models/orderItemsModel";
import Order from "../models/orderModel";
import CustomError from "../types/customError";

export async function makeOrder(req: Request, res: Response, next: NextFunction) {
   const { user_id, sessionToken } = req.user;
   const { payment_method, credit_card } = req.body;

   if (!(payment_method && (payment_method === "cash" || (payment_method === "credit-card" && credit_card)) )) {
      const error = new Error("Missing Information. Please try again.") as CustomError;
      error.status = 400;
      return next(error);
   }

   try {
      
      const cartItemsTemp = await fetch(`${process.env.CART_SERVICE_URL}/list`, {
         headers: {
            "Authorization": req.headers.authorization as string,
         }
      });

      if (!cartItemsTemp.ok) {
         const error = new Error(`users-service response error: ${cartItemsTemp.statusText}`) as CustomError;
         error.status = cartItemsTemp.status;
         return next(error);
      }

      const cartItems = await cartItemsTemp.json() as any[];

      if (!cartItems.length) {
         const error = new Error("No cart item founded. Put some items in youe cart before making an order.") as CustomError;
         error.status = 400;
         return next(error);
      }

       let unavalibaleMessage = cartItems.reduce((acc, current) => {
         if (current.itemsDetail.stock >= current.item_count) return acc;
         return acc + ` [only ${current.itemsDetail.stock} instances of the item with id ${current.itemsDetail.id} exsist]`;
      }, "");

      if (unavalibaleMessage) {
         const error = new Error(`Not enough items as following:${unavalibaleMessage}`) as CustomError;
         error.status = 400;
         return next(error);
      }

      const userTemp = await fetch(`${process.env.USER_SERVICE_URL}/info/get`, {
         headers: {
            "Authorization": req.headers.authorization as string,
         }
      });

      if (!userTemp.ok) {
         const error = new Error(`users-service response error: ${userTemp.statusText}`) as CustomError;
         error.status = userTemp.status;
         return next(error);
      }

      const user = await userTemp.json();

      if (!(user.country && user.city && user.district && user.nearestPoI && user.phone_number)) {
         const error = new Error("User info are not complete. Make sure to submit all information needed") as CustomError;
         error.status = 400;
         return next(error);
      }

      let order_price = cartItems.reduce((acc, current) => acc + parseFloat(current.total_price), 0);

      const order = await Order.create({
         payment_method,
         credit_card: credit_card ? credit_card : null,
         order_price,
         user_id,
      }) as any;

      const items = cartItems.map((item) => {
         item = { ...item.dataValues };
         delete item.itemsDetail;
         item.order_id = order.id;
         return item;
      });
      
      await OrderItems.bulkCreate(items);
      
      res.status(200).json({ message: "Order made successfully", sessionToken });

      // run a check to see if more items are available and update accordinglly
      async function onFinish() {
         try {

            await fetch(`${process.env.CART_SERVICE_URL}/remove`, {
               method: "DELETE",
               headers: {
                  "Authorization": req.headers.authorization as string,
               }
            });

            
            type ItemToDecrement = {
               item_id: string,
               details: {
                  item_details_id: string,
                  item_count: number,
               }[]
            };
            
            const items: ItemToDecrement[] = []
            cartItems.map(item => {
               if (items.find(i => i.item_id === item.itemsDetail.item_id)) {
                  items.find(i => i.item_id === item.itemsDetail.item_id)?.details
                     .push({
                        item_details_id: item.item_details_id,
                        item_count: item.item_count,
                     });
               } else {
                  items.push({
                     item_id: item.itemsDetail.item_id,
                     details: [{
                        item_details_id: item.item_details_id,
                        item_count: item.item_count,
                     }]
                  });
               }
            });

            await Promise.all(
               items.map(i => fetch(`${process.env.CART_SERVICE_URL}/remove`, {
                  method: "PATCH",
                  headers: {
                     "Authorization": req.headers.authorization as string,
                  },
                  body: JSON.stringify(i),
               }))
            );
                        
         } catch (e) {
            console.log(e);
         }
      }
      res.on("finish", onFinish);

   } catch (e) {
      return next(e);
   }
};

export async function getOrder(req: Request, res: Response, next: NextFunction) {
   const { user_id } = req.user;

   try {
      const order = await Order.findAll({
         where: { user_id },
         attributes: { exclude: ["user_id", "updatedAt"] }
      });

      return res.status(200).json(order);
   } catch (e) {
      return next(e);
   }
};

export async function getOrderDetails(req: Request, res: Response, next: NextFunction) {
   const { id } = req.params;

   if (!id) {
      const error = new Error("Missing Information. Please try again.") as CustomError;
      error.status = 400;
      return next(error);
   }

   try {
      const orderDetails = await OrderItems.findAll(
         {
            where: { order_id: id },
            attributes: ["id", "item_count", "total_price", "item_details_id"],
         },
      ) as any[];

      const promises = orderDetails.map(o => 
         fetch(`${process.env.ITEMS_SERVICE_URL}/detail/available?item_details_id=${o.item_details_id}`)
      );

      const orderItemsTemp = await Promise.all(promises);

      const orderItems = await Promise.all(orderDetails.map(o => {
         if (!o.ok) {
            const error = new Error(`items-service response error: ${o.statusText}`) as CustomError;
            error.status = o.status;
            return next(error);
         }
         return o.json();
      }));

      return res.status(200).json(orderItems);
   } catch (e) {
      return next(e);
   }
};
