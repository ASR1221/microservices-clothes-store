import { NextFunction, Request, Response } from "express";
import fs from "fs";

import { Op } from "sequelize";

import ItemsImages from "../models/imagesModel";
import ItemsDetails from "../models/itemsDetailsModel";
import Items from "../models/itemsModel";
import COLORS from "../constants/colors";
import SIZES from "../constants/sizes";
import CustomError from "../types/customError";
import Order from "../models/orderModel";
import OrderItems from "../models/orderItemsModel";
import Users from "../models/usersModel";

export async function listServedItems(req: Request, res: Response, next: NextFunction) {
   const { roles } = req.user;
   const { from, to } = req.query;

   if (!roles.includes("finance")) {
      const error = new Error("You are not allowed to visit this route.") as CustomError;
      error.status = 401;
      return next(error);
   }

   if (!(from && to)) {
      const error = new Error("You have to specify the 'from' and the 'to' or both.") as CustomError;
      error.status = 400;
      return next(error);
   }
   
   try {
      
      const exclude = ["createdAt", "updatedAt"];

      const orders = await Order.findAll({
         where: {
            served: true,
            updatedAt: {
               [Op.between]: [from, to]
            },
         },
         attributes: { exclude: ["served", "user_id", "updatedAt"] },
         include: {
            model: Users,
            attributes: { exclude, },
         },
      }) as any[];

      const result = await Promise.all(orders.map(order =>
         OrderItems.findAll({
            where: { order_id: order.id },
            attributes: ["item_count", "total_price"],
            include: {
               model: ItemsDetails,
               attributes: ["size", "color"],
               include: {
                  model: Items,
                  attributes: ["id", "name", "price", "section", "type"],
               } as any
            }
         })
      ));

      const allOrders = orders.map((o, i) => ({ ...o, orderItem: result[i] }));

      return res.status(200).json(allOrders);

   } catch (e) {
      return next(e);
   }
};

export async function listPendingItems(req: Request, res: Response, next: NextFunction) {
   const { roles } = req.user;
   const { country, city } = req.query;

   if (!roles.includes("orders")) {
      const error = new Error("You are not allowed to visit this route.") as CustomError;
      error.status = 401;
      return next(error);
   }

   if (!(country && city)) {
      const error = new Error("You have to specify the country or the city or both.") as CustomError;
      error.status = 400;
      return next(error);
   }

   try {
      const orders = await Order.findAll({
         where: {
            served: false,
         },
         attributes: { exclude: ["served", "user_id", "updatedAt"] },
         include: {
            model: Users,
            attributes: { exclude: ["id", "createdAt", "updatedAt"] },
         },
      }) as any[];
   
      const result = await Promise.all(orders.flatMap(order => {
         if (order.user.country !== country || order.user.city !== city) {
            return [];
         }
         return OrderItems.findAll({
            where: { order_id: order.id },
            attributes: ["item_count", "total_price"],
            include: {
               model: ItemsDetails,
               attributes: ["size", "color"],
               include: {
                  model: Items,
                  attributes: ["Id", "name", "price", "section", "type"],
               } as any,
            }
         });
      }));

      const allOrders = orders.map((o, i) => ({ ...o, orderItem: result[i] }));

      return res.status(200).json(allOrders);

   } catch (e) {
      return next(e);
   }
};

export async function addNewItem(req: Request, res: Response, next: NextFunction) {
   const { sessionToken, roles } = req.user;
   const { name, price, section, type, details } = JSON.parse(req.body.json);
   const detailsP = details as { color: string, sizes: { stock: number, size: string }[] }[];
   
   let item: any;
   try {
      if (!roles.includes("uploading")) {
         const error = new Error("You are not allowed to visit this route.") as CustomError;
         error.status = 401;
         throw error;
      }

      if (!(name && price && section && type && req.files && (detailsP && detailsP.length > 0))) {
         const error = new Error("Missing Information. Please try again.") as CustomError;
         error.status = 400;
         throw error;
      }   

      if (!/^\d+$/.test(price)) {
         const error = new Error("price has to be a decimal number with 2 digits after the dot (example: 20.50)") as CustomError;
         error.status = 400;
         throw error;
      }

      const allowCreate = detailsP.every(obj => {
         if (!COLORS.includes(obj.color)) {
            return false;
         }
         return obj.sizes.every(elm => elm.stock > 0 && elm.stock % 1 === 0 && SIZES.includes(elm.size));
      });

      if (!allowCreate) {
         const error = new Error("Information provided are wrong") as CustomError;
         error.status = 400;
         throw error;
      }

      item = await Items.create({
         name,
         price,
         image_path: `/images/items/${req.files.images[0].filename}`,
         section,
         type,
      }) as any;

      let promises: Promise<any>[] = [];

      for (let i = 0; i < 3; i++) {
         const imagePath = `/images/items/${req.files.images[i].filename}`;
         const promise = ItemsImages.create({
            item_id: item.id,
            path: imagePath,
         });
         promises.push(promise);
      }

      await Promise.all(promises);
      promises = [];

      details.forEach((obj: any) => {
         
         obj.sizes.forEach((elm: any) => {
            const promise = ItemsDetails.create({
               size: elm.size,
               color: obj.color,
               stock: elm.stock,
               item_id: item.id,
            });
            promises.push(promise);
         });
      });
      
      await Promise.all(promises);

      return res.status(200).json({ message: "Item added successfully.", sessionToken });

   } catch (e) {
      try {

         if (req.files.images) {
            for (let i = 0; i < 3; i++) {
               fs.unlink(req.files.images[i].path, (err) => {
                  if (err) throw err;
               });
            }
         }

         if (item) {
            await ItemsImages.destroy({ where: { item_id: item.id } });
            await item.destroy();
         }

      } catch (e) {
         console.log(`Deleting error: ${e}`)
      }

      return next(e);
   }
};

export async function updateStock(req: Request, res: Response, next: NextFunction) {
   const { sessionToken, roles } = req.user;
   const { id, detailsP } = req.body;

   const details = detailsP as { color: string, sizes: { stock: number, size: string }[] }[];

   if (!roles.includes("uploading")) {
      const error = new Error("You are not allowed to visit this route.") as CustomError;
      error.status = 401;
      return next(error);
   }

   if (!(id && details)) {
      const error = new Error("Missing Information. Please try again.") as CustomError;
      error.status = 400;
      return next(error);
   }

   const allowCreate = details.every(obj => {
      if (!COLORS.includes(obj.color)) {
         return false;
      }
      return obj.sizes.every(elm => elm.stock > 0 && elm.stock % 1 === 0 && SIZES.includes(elm.size));
   });

   if (!allowCreate) {
      const error = new Error("Information provided are wrong") as CustomError;
      error.status = 400;
      return next(error);
   }

   try {
      let promises: Promise<any>[] = [];
      details.forEach(obj => {
            
         obj.sizes.forEach(size => {
            const promise = ItemsDetails.findOrCreate({
               defaults: {
                  size: size.size,
                  color: obj.color,
                  stock: size.stock,
                  item_id: id,
               },
               where: {
                  item_id: id,
                  color: obj.color,
                  size: size.size
               }
            });
            promises.push(promise);
         });
      });
      
      let results = await Promise.all(promises);

      promises = [];
      let i = 0;
      let createdFlag = false;

      details.forEach(obj => {
         obj.sizes.forEach((size) => {
            const [itemDetail, created] = results[i];
            i++;
            if (created) {
               createdFlag = true;
               return;
            }
            itemDetail.stock = itemDetail.stock + size.stock;
            promises.push(itemDetail.save());
         })
      });

      results = await Promise.all(promises);
   
      const isUpdated = results.length || createdFlag;
   
      if (!isUpdated) {
         const error = new Error("Nothing got updated.") as CustomError;
         error.status = 400;
         return next(error);
      }
   
      await Items.update({ available: true }, { where: { id, available: false } });
   
      res.status(200).json({ message: "Updated", sessionToken });
   } catch (e) {
      return next(e);
   }

};