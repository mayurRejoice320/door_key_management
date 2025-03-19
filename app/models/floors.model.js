const mongoose = require("mongoose");
const validator = require("validator");

const floorsSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Types.ObjectId, // project owner id
      ref: "users",
    },
    tower_id: {
      type: mongoose.Types.ObjectId, // project owner id
      ref: "towers",
    },
    floor_no: {
      type: String,
      required: true,
      trim: true,
      default: null,
    },
    image_url: { type: String, default: null }, // floors image
    is_active: { type: Boolean, default: true, required: true },
    is_delete: { type: Boolean, default: false }, // deleted : 1, note delete: 0
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false }
);

module.exports = mongoose.model("floors", floorsSchema);
