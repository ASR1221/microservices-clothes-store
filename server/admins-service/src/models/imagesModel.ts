import { DataTypes } from "sequelize";
import { sequelizeItemDB } from "../utils/database";

import Items from "./itemsModel";

const ItemsImages = sequelizeItemDB.define("itemsImages", {
   id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
   },
   path: {
      type: DataTypes.STRING(255),
      allowNull: false,
   },
}, {
   tableName: "itemsImages",
});

ItemsImages.belongsTo(Items, {
   foreignKey: {
      name: "item_id",
      // type: DataTypes.BIGINT,
      allowNull: false,
   }
});

export default ItemsImages;