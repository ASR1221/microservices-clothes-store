import { DataTypes } from "sequelize";
import sequelize from "../utils/database";

const Items = sequelize.define("items", {
   id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
   },
   name: {
      type: DataTypes.STRING(30),
      allowNull: false,
   },
   price: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false,
   },
   image_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
   },
   section: {
      type: DataTypes.ENUM("men", "women", "kids"),
      allowNull: false,
   },
   type: {
      type: DataTypes.ENUM("jeans", "shirts", "coats", "dresses", "skirts"),
      allowNull: false,
   },
   available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
   } 
}, {
   tableName: "items",
});

export default Items;