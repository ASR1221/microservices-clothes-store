import { DataTypes } from "sequelize";

import { sequelizeUserDB } from "../utils/database";
import Users from "./usersModel";

const Admins = sequelizeUserDB.define("admins", {
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