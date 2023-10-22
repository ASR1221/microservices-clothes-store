const { Sequelize } = require("sequelize");

if (process.env.NODE_ENV !== "production") {
   require("dotenv").config();
}

// Database connection
const sequelize = new Sequelize({
   database: process.env.MYSQLDATABASE,
   username: process.env.MYSQLUSER,
   password: process.env.MYSQLPASSWORD,
   host: process.env.MYSQLHOST,
   port: process.env.MYSQLPORT,
   dialect: "mysql",
});

// chech if connection is good //! DELETE later
sequelize.authenticate()
   .then(() => console.log('Connection has been established successfully.'))
   .catch(e => console.error('Unable to connect to the database:', e));

module.exports = sequelize;
 