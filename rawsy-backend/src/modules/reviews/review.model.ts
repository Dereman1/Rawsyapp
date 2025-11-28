import { Schema, model } from "mongoose";

const ReviewSchema = new Schema(
  {
    supplier: { type: Schema.Types.ObjectId, ref: "User", required: true },
    manufacturer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },

    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },

    // optional: mark as helpful / moderation flags later
    approved: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default model("Review", ReviewSchema);
