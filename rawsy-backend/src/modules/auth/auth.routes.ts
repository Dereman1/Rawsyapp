import { NextFunction,Request,Response, Router } from "express";
import {
  register,
  login,
  listManufacturers,
  listAllUsers,
  suspendManufacturer,
  deleteManufacturer,
  unsuspendManufacturer,
  updateLanguage
} from "./auth.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/admin.middleware";

import User from "./auth.model";
import { uploadSingle } from "../../middlewares/upload.middleware";
import { uploadProfileImage } from "./uploadProfile.controller";
import { getPublicUserProfile } from "./user.profile.controller";
import { uploadVerificationDoc } from "./verification.controller";
import { updateFactoryOrBusinessLocation } from "./location.controller";
import { changePassword } from "./password.controller";
import { logout } from "./logout.controller";

const router = Router();

// ---------------- AUTH ----------------
router.post("/register", register);
router.post("/login", login);

// ---------------- ADMIN MANUFACTURER MANAGEMENT ----------------
router.get("/manufacturers", authenticate, requireAdmin, listManufacturers);
router.get("/users", authenticate, requireAdmin, listAllUsers);

router.put("/manufacturer/:id/suspend", authenticate, requireAdmin, suspendManufacturer);
router.put("/manufacturer/:id/unsuspend", authenticate, requireAdmin, unsuspendManufacturer);

router.delete("/manufacturer/:id", authenticate, requireAdmin, deleteManufacturer);

// ---------------- USER PROFILE ----------------
router.get("/me", authenticate, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.json({ profile: user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put("/me", authenticate, async (req: any, res) => {
  try {
    const allowed = ["name", "phone", "companyName", "tinNumber"];
    const updates: any = {};

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");

    return res.json({ message: "Profile updated", profile: updatedUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Profile Image Upload
router.post(
  "/me/upload-image",
  authenticate,
  (req, res, next) =>
    uploadSingle("image")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    }),
  uploadProfileImage
);

// Public profile
router.get("/profile/:id", authenticate, getPublicUserProfile);

// Factory / Business Location
router.put("/me/location", authenticate, updateFactoryOrBusinessLocation);

// Upload verification document
router.post(
  "/me/upload-doc",
  authenticate,
    
    uploadSingle("file"),
  uploadVerificationDoc
);

// ⭐ UPDATE LANGUAGE (Manufacturers Only Use Multi-Language)
router.put("/language", authenticate, updateLanguage);

// Change password
router.put("/me/change-password", authenticate, changePassword);

// Logout
router.post("/logout", authenticate, logout);

export default router;
