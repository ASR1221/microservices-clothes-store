import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import OrderItems from "../models/orderItemsModel";
import Order from "../models/orderModel";
import CustomError from "../types/customError";

if (process.env.NODE_ENV !== "production") {
   dotenv.config();
}

export async function makeOrder(req: Request, res: Response, next: NextFunction) {
   const { user_id, sessionToken } = req.user;
   const { payment_method, payment_service } = req.body;

   if (!(payment_method && (payment_method === "cash" || (payment_method === "credit-card" && payment_service)) )) {
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
         payment_service: payment_service ?? null,
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

      // Payment here
      const ZAINCASH_URL = process.env.URL as string;
      const TRANSACTION_INIT_ROUTE = process.env.TRANSACTION_INIT_ROUTE as string;
      const MSISDN = process.env.MSISDN as string;
      const MERCHANT_ID = process.env.MERCHANT_ID as string;
      const MERCHANT_SECRET = process.env.MERCHANT_SECRET as string;

      const data = {
         amount: order_price,
         serviceType: "clothes order",
         msisdn: MSISDN,
         orderId: order.id,
         redirectUrl: `${process.env.ORDER_SERVICE_URL}/order/payment/complete`,
      };

      let token: string;
      jwt.sign(data, MERCHANT_SECRET, {
         expiresIn: Date.now() + (1000 * 10),
      }, async (err, token) => {
         if (err) {
            return next(err);
         }

         const postData = {
            token,
            merchantId: MERCHANT_ID,
            lang: "en",
         };

         const response = await fetch(`${ZAINCASH_URL}${TRANSACTION_INIT_ROUTE}`, {
            method: "POST",
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
         });

         if (!response.ok) {
            return next(`ZAINCASH ERROR: ${response.statusText}`);
         }

         const data = await response.json();

         res.status(200).json({ id: data.id, sessionToken, });
      });
      
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


export async function completePayment(req: Request, res: Response, next: NextFunction) {

   const token = req.body.token;
   const MERCHANT_SECRET = process.env.MERCHANT_SECRET as string;

   if (!token) {
      const error = new Error("No token received. Payment failed") as CustomError;
      error.status = 400;
      return next(error);
   }
   
   jwt.verify(token, MERCHANT_SECRET, async (err: any, payload: any) => {

      if (err) return next(err);

      try {
         await Order.update({
            payment_status: payload.status === "failed" || payload.status === "pending" ? "failed" : "completed",
         }, {
            where: { id: payload.id, transaction_id: payload.id }
         });

         return res.status(200);
      } catch (error) {
         return next(error);
      }

   });
}
