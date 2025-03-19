const jwt = require("jsonwebtoken");
const Users = require("../models/users.model");
const { ROLE } = require("../utils/constant");
const MESSAGE = require("../utils/message.js");

// Required Config
const JWT_SECRET = process.env.JWT_SECRET;

module.exports =
  ({ usersAllowed = [] } = {}) =>
  async (req, res, next) => {
    const token = req.header("x-auth-token");

    // Check if token exists
    if (!token) {
      return res.status(400).json({ success: false, message: MESSAGE.NO_PROVIDE("Token") });
    }

    try {
      // Verify token
      await jwt.verify(token, JWT_SECRET, async function (err, decoded) {
        if (err) {
          return res.status(400).json({ success: false, message: err.message });
        }

        // Find the user associated with the token
        const user = await Users.findOne({ _id: decoded.user_id }).populate("role_id", "role");
        if (!user) {
          return res.status(400).json({ success: false, message: MESSAGE.INVALID("Token!") });
        }
        if (!usersAllowed.includes(user.role_id.role)) {
          return res.status(400).json({ success: false, message: MESSAGE.UNAUTHORIZED });
        }

        if (!user.is_active) {
          return res.status(400).json({ success: false, message: MESSAGE.DEACTIVATED("Your profile") });
        }

        // Attach the user object to the request
        req.user = user;
        next();
      });
    } catch (e) {
      console.error("Error in auth middleware: ", e);
      return res.status(400).json({ success: false, message: MESSAGE.UNAUTHORIZED });
    }
  };
