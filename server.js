var express = require("express");
var bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
const dotenv = require("dotenv");
dotenv.config();

// const seeder = require("./app/seeders");

const db = require("./app/models");

require("./app/routes/users.routes")(app);

app.get("/", function (req, res) {
  res.send("Hello World");
});

// catching 404 error and forward to error handler
app.use(function (req, res, next) {
  return next(createError(404, "This resource was not found"));
});

// error handler// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(404).json({
    status: false,
    statuscode: err.status,
    message: err.message,
  });
});

var PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  console.log(`Server is running on port : ${PORT}`);
});
