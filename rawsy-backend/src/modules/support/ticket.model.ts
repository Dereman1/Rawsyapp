import { Schema, model } from "mongoose";
const FileSchema = new Schema(
  {
    filename: { type: String },
    mimetype: { type: String },
    url: { type: String }
  },
  { _id: false }
);
const TicketSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["open", "in_progress", "resolved"], default: "open" },
  
  adminReply: { type: String, default: "" },

    // 📎 User attachments
    attachments: { type: [FileSchema], default: [] },

    // 📎 Admin attachments (reply files)
    adminAttachments: { type: [FileSchema], default: [] },

    // 📌 Time resolved
    resolvedAt: { type: Date, default: null }

}, { timestamps: true });

export default model("SupportTicket", TicketSchema);
