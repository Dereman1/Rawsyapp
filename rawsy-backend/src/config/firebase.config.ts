import admin from "firebase-admin";
import path from "path";
import fs from "fs";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountPath) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT is missing in .env");
}

const absolutePath = path.resolve(serviceAccountPath);

if (!fs.existsSync(absolutePath)) {
  throw new Error("Service account JSON not found at: " + absolutePath);
}

admin.initializeApp({
  credential: admin.credential.cert(absolutePath),
});

export const firebaseAdmin = admin;
