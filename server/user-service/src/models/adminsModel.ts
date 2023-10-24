import { DataTypes } from "sequelize";

import sequelize from "../utils/database";
import Users from "./usersModel";

const Admins = sequelize.define("admins", {
   id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
   },
   role: {
      type: DataTypes.ENUM("uploading", "finance", "orders"),
      allowNull: false,
   }
}, {
   tableName: "admins",
});

Admins.belongsTo(Users, {
   foreignKey: {
      name: "user_id",
      allowNull: false,
      // type: DataTypes.UUID,
   }
});

export default Admins;