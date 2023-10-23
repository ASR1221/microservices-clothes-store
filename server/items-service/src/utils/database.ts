import { Sequelize } from "sequelize";

if (process.env.NODE_ENV !== "production") {
   require("dotenv").config();
}

// Database connection
const sequelizeDB = new Sequelize({
   database: process.env.MYSQLDATABASE,
   username: process.env.MYSQLUSER,
   password: process.env.MYSQLPASSWORD,
   host: process.env.MYSQLHOST,
   port: Number(process.env.MYSQLPORT) ?? 3306,
   dialect: "mysql",
});

// chech if connection is good //! DELETE later
sequelizeDB.authenticate()
   .then(() => console.log('Connection has been established successfully.'))
   .catch((e: any) => console.error('Unable to connect to the database: ', e));

export default sequelizeDB;
 