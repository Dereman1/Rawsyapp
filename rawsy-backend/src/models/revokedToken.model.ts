import { Schema, model } from "mongoose";

const RevokedTokenSchema = new Schema({
  token: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } } // TTL index
});

// expireAfterSeconds: 0 means Mongo will remove the document at 'expiresAt'
export default model("RevokedToken", RevokedTokenSchema);
