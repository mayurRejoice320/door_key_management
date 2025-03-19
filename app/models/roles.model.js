const mongoose = require("mongoose");
const { ROLE } = require("../utils/constant.js");

const roleSchema = mongoose.Schema(
  {
    role: {
      type: String,
      enum: [ROLE.ADMIN, ROLE.PROJECT, ROLE.AGENCY, ROLE.USER],
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_delete: { type: Boolean, default: false }, // deleted : 1, note delete: 0
  },
  { timestamps: true, versionKey: false }
);

const Role = mongoose.model("roles", roleSchema);
module.exports = Role;
