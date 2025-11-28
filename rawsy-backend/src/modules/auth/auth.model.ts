import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String },

    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },

    password: { type: String, select: false },

    role: {
      type: String,
      enum: ["manufacturer", "supplier", "admin"],
      default: "manufacturer"
    },

    // 🔐 Supplier verification documents
    verificationDocs: [
      {
        url: String,
        filename: String,
        type: String,
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending"
        },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],

    // 🟡 Account status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended", "active"],
      default: function () {
        return this.role === "supplier" ? "pending" : "active";
      }
    },
   deviceTokens: [{ type: String }],
    // 📍 Manufacturer factory location
    factoryLocation: {
      address: String,
      placeName: String,
      contactName: String,
      contactPhone: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },

    // 📍 Supplier business location
    businessLocation: {
      address: String,
      placeName: String,
      contactName: String,
      contactPhone: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    language: {
  type: String,
  enum: ["en", "am", "om"],
  default: "en"
},

    // ⭐ Trust Badge (extra, not required to sell)
    verifiedSupplier: { type: Boolean, default: false },

    profileImage: { type: String, default: null },

    // 📊 Ratings
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    companyName: String,
    tinNumber: String,

    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],

    cart: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 }
      }
    ]
  },

  { timestamps: true }
);

export default model("User", UserSchema);
