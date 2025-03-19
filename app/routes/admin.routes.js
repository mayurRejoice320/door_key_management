const controller = require("../controller/admin/admin.controller");
const multer = require("multer");
const { upload } = require("../services/imgploads"); // Import multer configuration
const userCommonServices = require("../controller/users/common.services");
const { ROLE } = require("../utils/constant");
const authMiddleware = require("../middlewares/auth");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    next();
  });

  app.get("/api/login", /* userCommonServices.addValidation, */ controller.login);
  app.post("/api/addproject", authMiddleware({ usersAllowed: [ROLE.ADMIN] }), /* userCommonServices.addValidation, */ controller.addProject);
};
