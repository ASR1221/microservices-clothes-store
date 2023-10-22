const { DataTypes } = require("sequelize");
const sequelize = require("../../utils/database");

const Users = sequelize.define("users", {
   id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
   },
   name: {
      type: DataTypes.STRING(30),
      allowNull: false,
   },
   email: {
      type: DataTypes.STRING(50),
      unique: true,
   },
   phone_number: {
      type: DataTypes.STRING(20),
      unique: true,
   },
   country: {
      type: DataTypes.STRING(30),
   },
   city: {
      type: DataTypes.STRING(30),
   },
   district: {
      type: DataTypes.STRING(30),
   },
   nearestPoI: {
      type: DataTypes.STRING(100),
   },
}, {
   tableName: "users",
});

module.exports = Users;