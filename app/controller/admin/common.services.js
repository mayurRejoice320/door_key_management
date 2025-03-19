// const db = require("../../models");
// const { check, validationResult } = require("express-validator");
// const Op = db.Sequelize.Op;

// module.exports = {

//   addValidation: [
//     check('name').trim().notEmpty().withMessage("Collage name is required!").bail(),

//     (req, res, next) => {
//       const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
//         return `${msg}`;
//       };
//       const result = validationResult(req).formatWith(errorFormatter);
//       if (!result.isEmpty()) {
//         return res.status(422).json({ "success": "false", "message": result.array().join(", ") });
//       }
//       next();
//     },

//   ],

//   bodyValidation : (req, res, next) => {
//     if (Object.keys(req.body).length === 0) {
//       return res.status(400).json({ "success": "false", "message": "Request body cannot be empty!" });
//     }
//     next();
//   }

// }

const { check, validationResult } = require("express-validator");

module.exports = {
  addValidation: [
    check("name").trim().notEmpty().withMessage("College name is required!").bail(),

    (req, res, next) => {
      const errorFormatter = ({ msg }) => msg;
      const result = validationResult(req).formatWith(errorFormatter);

      if (!result.isEmpty()) {
        return res.status(422).json({ success: "false", message: result.array().join(", ") });
      }

      next();
    },
  ],

  bodyValidation: (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: "false", message: "Request body cannot be empty!" });
    }
    next();
  },
};
