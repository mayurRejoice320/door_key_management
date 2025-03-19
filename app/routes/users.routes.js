const controller = require("../controller/users/users.controller");
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

  app.get("/api/project/login", /* userCommonServices.addValidation, */ controller.login);

  app.post("/api/project/tower", authMiddleware({ usersAllowed: [ROLE.PROJECT] }), /* userCommonServices.addValidation, */ controller.addTower);
  app.get("/api/project/tower", authMiddleware({ usersAllowed: [ROLE.PROJECT] }), /* userCommonServices.addValidation, */ controller.getAllTower);

  app.post("/api/project/tower/floor", authMiddleware({ usersAllowed: [ROLE.PROJECT] }), /* userCommonServices.addValidation, */ controller.addFloorOfTower);
  app.get("/api/project/tower/floor", authMiddleware({ usersAllowed: [ROLE.PROJECT] }), /* userCommonServices.addValidation, */ controller.getAllFloorTower);

  app.post("/api/project/tower/floor/flate", authMiddleware({ usersAllowed: [ROLE.PROJECT] }), /* userCommonServices.addValidation, */ controller.addFlatNoOfTower);
  app.get("/api/project/tower/floor/flate", authMiddleware({ usersAllowed: [ROLE.PROJECT] }), /* userCommonServices.addValidation, */ controller.getAllFlatNoOfTower);

  app.post("/api/project/door", authMiddleware({ usersAllowed: [ROLE.PROJECT] }), /* userCommonServices.addValidation, */ controller.addDoorForDropDown);
  app.get("/api/project/door", authMiddleware({ usersAllowed: [ROLE.PROJECT] }), /* userCommonServices.addValidation, */ controller.getAllDoorType);

  app.post("/api/agency", authMiddleware({ usersAllowed: [ROLE.PROJECT] }), /* userCommonServices.addValidation, */ controller.add);
  app.put("/api/agency/:id",authMiddleware({ usersAllowed: [ROLE.PROJECT] }), /* userCommonServices.bodyValidation, */ controller.updateById);
  app.delete("/api/agency/:id", authMiddleware({ usersAllowed: [ROLE.PROJECT] }), controller.deleteById);
  app.get("/api/agency", authMiddleware({ usersAllowed: [ROLE.PROJECT] }), controller.viewAllAgency); // use page, size, ans s(seraching) in query
  app.get("/api/agency/:id", authMiddleware({ usersAllowed: [ROLE.PROJECT] }), controller.viewById);

  app.post("/api/key", /* userCommonServices.addValidation, */ controller.addKey);
  app.put("/api/key/:id", /* userCommonServices.bodyValidation, */ controller.updateKeyById);
  app.delete("/api/key/:id", controller.deleteKeyById);
  app.get("/api/key", controller.viewAllKeyOfProject); // use page, size, ans s(seraching) in query
  app.get("/api/key/:id", controller.viewKeyById);

  // assign key ---------------
  app.post("/api/assignkey", /* userCommonServices.addValidation, */ controller.assignKey);
  app.get("/api/agencies", /* userCommonServices.addValidation, */ controller.getAllAgency);
  app.get("/api/occupiedkey", /* userCommonServices.addValidation, */ controller.getAllOccupiedKey);

  app.post("/api/imageupload", /* userCommonServices.addValidation, */ upload.single("image_url"), controller.uploadS3Image);
};
