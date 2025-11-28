import { Schema, model } from "mongoose";

const ProductReviewSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: { type: String }
  },
  { timestamps: true }
);

export default model("ProductReview", ProductReviewSchema);
