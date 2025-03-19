const mongoose = require("mongoose");
const validator = require("validator");

const flatsSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Types.ObjectId, // project owner id
      ref: "users",
    },
    tower_id: {
      type: mongoose.Types.ObjectId, // tower id
      ref: "towers",
    },
    floor_id: {
      type: mongoose.Types.ObjectId, // floors id
      ref: "floors",
    },
    flat_no: {
      type: Number,
      required: true,
      trim: true,
      default: 0,
    },
    image_url: { type: String, default: null }, // flats image
    is_active: { type: Boolean, default: true, required: true },
    is_delete: { type: Boolean, default: false }, // deleted : 1, note delete: 0
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false }
);

module.exports = mongoose.model("flats", flatsSchema);
