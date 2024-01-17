import { DataTypes } from "sequelize";

import sequelize from "../utils/database";

const Order = sequelize.define(
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
      // credit_card: {
      //    type: DataTypes.STRING,
      // },
      order_price: {
         type: DataTypes.DECIMAL(10,2),
         allowNull: false,
      },
      // if payment_method == credit-card then payment_service and transaction_id are filled:
      payment_service: {
         type: DataTypes.STRING,
      },
      transaction_id: {
         type: DataTypes.STRING,
      },
      payment_status: {
         type: DataTypes.ENUM("completed", "failed", "pending"),
         defaultValue: "pending",
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
