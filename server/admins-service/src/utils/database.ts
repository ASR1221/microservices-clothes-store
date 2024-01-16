import { Options, Sequelize } from "sequelize";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
   dotenv.config();
}

const options: Options = {
   username: process.env.MYSQLUSER,
   password: process.env.MYSQLPASSWORD,
   host: process.env.MYSQLHOST,
   port: Number(process.env.MYSQLPORT) ?? 3306,
   dialect: "mysql",
};

// Database connection
export const sequelizeUserDB = new Sequelize({
   ...options,
   database: process.env.USERDATABASE,
});

// chech if connection is good //! DELETE later
sequelizeUserDB.authenticate()
   .then(() => console.log('Connection has been established successfully. (userDB)'))
   .catch((e: any) => console.error('Unable to connect to the database: ', e)); 


export const sequelizeItemDB = new Sequelize({
   ...options,
   database: process.env.ITEMDATABASE,
});

// chech if connection is good //! DELETE later
sequelizeItemDB.authenticate()
   .then(() => console.log('Connection has been established successfully. (itemDB)'))
   .catch((e: any) => console.error('Unable to connect to the database: ', e)); 


// export const sequelizeCartDB = new Sequelize({
//    ...options,
//    database: process.env.CARTDATABASE,
// });

// // chech if connection is good //! DELETE later
// sequelizeCartDB.authenticate()
//    .then(() => console.log('Connection has been established successfully. (cartDB)'))
//    .catch((e: any) => console.error('Unable to connect to the database: ', e));


export const sequelizeOrderDB = new Sequelize({
   ...options,
   database: process.env.ORDERDATABASE,
});

// chech if connection is good //! DELETE later
sequelizeOrderDB.authenticate()
   .then(() => console.log('Connection has been established successfully. (orderDB)'))
   .catch((e: any) => console.error('Unable to connect to the database: ', e)); 