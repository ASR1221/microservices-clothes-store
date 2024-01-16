import { DataTypes } from "sequelize";

import { sequelizeOrderDB } from "../utils/database";

const Order = sequelizeOrderDB.define(
   "order",
   {
      id: {
         type: DataTypes.BIGINT,
         primaryKey: true,
         autoIncrement: true,
         allowNull: false,
         unique: true,
      },
      payment_method: {
         type: DataTypes.ENUM("credit-card", "cash"),
         allowNull: false,
      },
      credit_card: {
         type: DataTypes.STRING,
      },
      order_price: {
         type: DataTypes.DECIMAL(10,2),
         allowNull: false,
      },
      served: {
         type: DataTypes.BOOLEAN,
         allowNull: false,
         defaultValue: false,
      },
      user_id: {
         type: DataTypes.UUID,
         allowNull: false,
      }
   },
   {
      tableName: "order",
      createdAt: "order_date",
   }
);

export default Order;
