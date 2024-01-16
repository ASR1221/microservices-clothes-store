import { DataTypes } from "sequelize";

import { sequelizeOrderDB } from "../utils/database";
import Order from "./orderModel";

const OrderItems = sequelizeOrderDB.define(
   "orderItems",
   {
      id: {
         type: DataTypes.BIGINT,
         primaryKey: true,
         autoIncrement: true,
         allowNull: false,
         unique: true,
      },
      item_count: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      total_price: {
         type: DataTypes.DECIMAL(10,2),
         allowNull: false,
      },
      item_details_id: {
         type: DataTypes.BIGINT,
         allowNull: false,
      }
   },
   {
      tableName: "orderItems",
   }
);

OrderItems.belongsTo(Order, {
   foreignKey: {
      name: "order_id",
      // type: DataTypes.BIGINT,
      allowNull: false,
   },
});

export default OrderItems;
