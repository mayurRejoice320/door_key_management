const mongoose = require("mongoose");
const validator = require("validator");

const towerSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Types.ObjectId, // project owner id
      ref: "users",
    },
    tower_name: {
      type: String,
      required: true,
      trim: true,
      default: null,
    },
    image_url: { type: String, default: null }, // tower image
    is_active: { type: Boolean, default: true, required: true },
    is_delete: { type: Boolean, default: false }, // deleted : 1, note delete: 0
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false }
);

module.exports = mongoose.model("towers", towerSchema);
