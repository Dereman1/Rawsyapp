import { Schema, model } from "mongoose";

const FAQSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  tags: { type: [String], default: [] }, // e.g. ["orders","payments"]
  visible: { type: Boolean, default: true }
}, { timestamps: true });

export default model("FAQ", FAQSchema);
