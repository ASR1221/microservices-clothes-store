import { DataTypes } from "sequelize";
import { sequelizeItemDB } from "../utils/database";

import Items from "./itemsModel";
import SIZES from "../constants/sizes";
import COLORS from "../constants/colors";

const ItemsDetails = sequelizeItemDB.define("itemsDetails", {
   id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
   },
   size: {
      type: DataTypes.ENUM(SIZES as unknown as string), // Really weird TS error solved(cheating) by as unknown as string
      allowNull: false,
   },
   color: {
      type: DataTypes.ENUM(COLORS as unknown as string), // Really weird TS error solved(cheating) by as unknown as string
      allowNull: false,
   },
   stock: {
      type: DataTypes.SMALLINT,
      allowNull: false,
   }
}, {
   tableName: "itemsDetails",
});

ItemsDetails.belongsTo(Items, {
   foreignKey: {
      name: "item_id",
      // type: DataTypes.BIGINT,
      allowNull: false,
   }
});

export default ItemsDetails;