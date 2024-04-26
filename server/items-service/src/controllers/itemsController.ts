import { NextFunction, Request, Response } from "express";

import { Op } from "sequelize";

import ItemsImages from "../models/imagesModel";
import ItemsDetails from "../models/itemsDetailsModel";
import Items from "../models/itemsModel";
import CustomError from "../types/customError";

export async function listItems(req: Request, res: Response, next: NextFunction) {
   const { section, type, page } = req.query;

   if (!section) {
      const error = new Error("No section specified") as CustomError;
      error.status = 400;
      return next(error);
   }

   try {
      const whereClause: {
         section: typeof section,
         available: boolean,
         type?: typeof type,
      } = {
         section,
         available: true,
      }

      if (type) {
         whereClause.type = type;
      }

      const items = await Items.findAll({
         where: whereClause,
         attributes: { exclude: ["section", "available", "createdAt", "updatedAt"] },
         limit: 12,
         offset: (Number(page) - 1) * 12,
      });

      const result: {
         nextCursor: number | null,
         items: typeof items,
      } = {
         nextCursor: Number(page) + 1,
         items,
      };
      if (items.length < 12) result.nextCursor = null;
   
      return res.status(200).json(result);

   } catch (e) {
      return next(e);
   }
};

export async function itemDetails(req: Request, res: Response, next: NextFunction) {
   const { id } = req.params;

   if (!id) {
      const error = new Error("No item specified") as CustomError;
      error.status = 400;
      return next(error);
   }

   try {
      
      const item = await Items.findOne({
         where: { id, available: true },
         attributes: ["name", "price", "section", "type"],
      }) as any;

      if (item && item.length < 1) {
         const error = new Error("Item is not available.") as CustomError;
         error.status = 404;
         return next(error);
      }
      
      const itemDetails = await ItemsDetails.findAll({
         where: {
            item_id: id,
            stock: { [Op.gt]: 0 },
         },
         attributes: { exclude: ["createdAt", "updatedAt"] },
      });

      if (itemDetails.length < 1) {
         const error = new Error("Item is out of stock.") as CustomError;
         error.status = 404;
         return next(error);
      }
      
      const imagesRes = await ItemsImages.findAll({
         where: { item_id: id },
         attributes: ["path"],
      }) as unknown as { path: string }[];

      const images = imagesRes.map(img => img.path);

      return res.status(200).json({
         item,
         itemDetails,
         images,
      });

   } catch (e) {
      return next(e);
   }
};

export async function searchItem(req: Request, res: Response, next: NextFunction) {
   const { term, page } = req.query;

   if (typeof term !== "string") {
      const error = new Error("Missing Information. You have to specify 'term' of the search.") as CustomError;
      error.status = 400;
      return next(error);
   }

   const terms = term.split(" ");
   const searchQuery = terms.map(word => ({
      [Op.or]: [
         {
            name: { [Op.like]: `%${word}%` },
         },
         {
            section: { [Op.like]: `%${word}%` },
         },
         {
            type: { [Op.like]: `%${word}%` },
         },
      ]
   }));

   try {
      const results = await Items.findAll({
         where: {
            [Op.and]: searchQuery,
            available: true,
         },
         attributes: { exclude: ["available", "createdAt", "updatedAt"] },
         limit: 12,
         offset: (Number(page) - 1) * 12,
      }) as any[];
      
      const fResult = results.filter(item => {
         if (/\bmen\b/i.test(term)) {
            if (item.section === "men") {
               return true;
            } 
            return false;
         } 
         return true;
      });

      const relevanceItems = fResult.map(item => ({
         item,
         score: terms.reduce((score, word) => score + (
            item.name.match(new RegExp(word, "gi")) ||
            item.section.match(new RegExp(word, "gi")) ||
            item.type.match(new RegExp(word, "gi"))
         )?.length || 0, 0)
      }));

      const sortedItems = relevanceItems.sort((a, b) => b.score - a.score);
      const items = sortedItems.map((item) => { 
         const newItem = item.item;
         return newItem;
      });

      const result: {
         nextCursor: number | null,
         items: typeof items,
      } = {
         nextCursor: Number(page) + 1,
         items,
      };
      if (items.length < 12) result.nextCursor = null;

      res.status(200).json(result);

   } catch (e) {
      return next(e);
   }
}


// checkAvailable is for cart-service usage   //* when an items is to be added to cart, the item has to available
export async function checkAvailable(req: Request, res: Response, next: NextFunction) {

   const { item_details_id, item_count } = req.query;

   const whereClause: {
      id: string,
      stock?: any,
   } = {
      id: item_details_id as string,
   };

   if (item_count) whereClause.stock = { [Op.gt]: Number(item_count) ?? 0 }

   try {
      const item = await ItemsDetails.findOne({
         where: whereClause,
         include: [{
            model: Items,
            attributes: ["price", "available", "name", "image_path", "id"],
         }],
      }) as any;
      
      if (!item) {
         const error = new Error("Sorry, we don't have this amount of the item.") as CustomError;
         error.status = 400;
         return next(error);
      }

      const final = {
         itemId: item.item.id,
         itemDetailsId: item.id,
         stock: item.stock,
         color: item.color,
         size: item.size,
         name: item.item.name,
         price: item.item.price,
         img: item.item.image_path,
      }
   
      return res.status(200).json(final);
   } catch (e) {
      return next(e);
   }
}

type ItemToDecrement = {
   item_id: string,
   details: {
      item_details_id: string,
      item_count: number,
   }[]
}

// decrementStock is for order-service usage   //* when an order is made, the stock of the items ordered has to decrease
export async function decrementStock(req: Request, res: Response, next: NextFunction) {
   const item: ItemToDecrement = req.body;

   if (!item) {
      const error = new Error("No items to decrement.") as CustomError;
      error.status = 400;
      return next(error);
   }

   try {

      const promise1: Promise<any>[] = [];
      const counts: number[] = [];

      item.details.forEach(detail => {
         promise1.push(ItemsDetails.findByPk(detail.item_details_id));
         counts.push(detail.item_count);
      });

      const dbItemsDetails = await Promise.all(promise1);

      dbItemsDetails.forEach((item, i) => {
         item.decrement("stock", { by: counts[i] });
      });

      const allItemDetails = await ItemsDetails.findAll({
         where: { item_id: item.item_id },
         attributes: ["stock"],
      }) as any[];

      if (allItemDetails.some((item) => item.stock > 0) === false) {
         Items.update({ available: false }, { where: { id: item.item_id } });
      }
      
      return res.status(200).json({ message: "Item Decremented" });
      
   } catch (e) {
      return next(e);
   }
}

export function healthCheck(req: Request, res: Response, next: NextFunction) {
   return res.status(200).json({ message: "good" });
}