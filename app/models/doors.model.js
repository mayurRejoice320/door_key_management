const mongoose = require("mongoose");
const validator = require("validator");

const doorsSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Types.ObjectId, // project owner id
      ref: "users",
    },
    door_type: { //main door, M.bed room door, C.bed room door
      type: String,
      required: true,
      trim: true,
    },
    image_url: { type: String, default: null }, // doors image
    is_active: { type: Boolean, default: true, required: true },
    is_delete: { type: Boolean, default: false }, // deleted : 1, note delete: 0
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false }
);

module.exports = mongoose.model("doors", doorsSchema);
