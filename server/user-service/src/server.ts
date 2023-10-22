const express = require("express");
const helmet = require("helmet");
const compression = require("express-compression");
const sequelize = require("./utils/database");

// const Users = require("./models/userModels/usersModel");

const app = express();

// Development imports
if (process.env.NODE_ENV !== "production") {
   require("dotenv").config();
   const logger = require("morgan");
   app.use(logger("dev"));
}

// Important middlewares
app.use(helmet());
app.use(helmet.hidePoweredBy());
app.use(compression());
app.use(express.json());
app.use(express.static("public"));

// database sync (should import model to work) //! DELETE after sync is complete
// sequelize.sync({ alter: true})
//    .then(() => console.log("database syncd"))
//    .catch(e => console.log(`database sync error: ${e}`));

// routes
app.use("/api/native", require("./routes/mainRoute"));
app.use("/api", require("./routes/mainRoute"));

// Handling 404 (Not found)
app.use((req, res, next) => {
   res.redirect("/");
});

// Error handler
app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message }));

app.listen(process.env.PORT || 3000);