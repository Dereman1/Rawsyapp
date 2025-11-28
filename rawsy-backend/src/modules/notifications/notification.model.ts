import { Schema, model } from "mongoose";

const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // receiver of the notification

    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
      type: String,
      enum: [
        // 🔹 Order Notifications
        "order_placed",
        "order_confirmed",
        "order_rejected",
        "order_cancelled",
        "order_in_transit",
        "order_delivered",
        "payment_completed",

        // 🔹 Quote Notifications
        "quote_requested",
        "quote_countered",
        "quote_accepted",
        "quote_rejected",
        "quote_cancelled",
        "quote_buyer_accepted",
        "quote_converted",

        "price_drop",
        "back_in_stock",
        "discount_started",
        // 🔹 Support Ticket Notifications
        "ticket_created",
        "ticket_resolved",
        // 🔹 Product Moderation (for suppliers)
        "product_approved",
        "product_rejected",

        // 🔹 Chat / messaging (future)
        "message"
      ],
      required: true
    },

    data: {
      type: Object, // e.g. { orderId: "...", quoteId: "...", product: "Cotton" }
      default: {}
    },

    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default model("Notification", NotificationSchema);
