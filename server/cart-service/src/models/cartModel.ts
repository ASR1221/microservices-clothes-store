import { DataTypes } from "sequelize";
import sequelize from "../utils/database";

const Cart = sequelize.define("cart", {
   id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
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
   user_id: {                 // takes it's value from users service
      type: DataTypes.UUID,
      allowNull: false,
   },
   item_details_id: {         // takes it's value from items service
      type: DataTypes.BIGINT,
      allowNull: false,
   }
}, {
   tableName: "cart",
});

export default Cart;