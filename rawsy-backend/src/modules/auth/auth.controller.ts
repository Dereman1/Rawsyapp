import { Request, Response } from "express";
import { registerUser, loginUser } from "./auth.service";
import User from "./auth.model";
import { saveNotification, sendPushNotification } from "../../services/notification.service";

// ---------------- REGISTER ----------------
export const register = async (req: Request, res: Response) => {
  try {
    const { language } = req.body; // 👈 NEW (accept language)

    const user = await registerUser({
      ...req.body,
      language: language || "en" // default English
    });

    return res.json(user);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

// ---------------- LOGIN ----------------
export const login = async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = req.body;
    const result = await loginUser(emailOrPhone, password);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};


// ---------------- ADMIN: LIST MANUFACTURERS ----------------
export const listManufacturers = async (req: Request, res: Response) => {
  try {
    const manufacturers = await User.find({ role: "manufacturer" }).select("-password");

    return res.json({
      count: manufacturers.length,
      manufacturers,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch manufacturers" });
  }
};

// ---------------- ADMIN: LIST ALL USERS (MANUFACTURERS & SUPPLIERS) ----------------
export const listAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({
      role: { $in: ["manufacturer", "supplier"] }
    }).select("-password").sort({ createdAt: -1 });

    return res.json({
      count: users.length,
      users,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

// ---------------- ADMIN: SUSPEND MANUFACTURER ----------------
export const suspendManufacturer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const targetUser: any = await User.findById(id);
    if (!targetUser)
      return res.status(404).json({ error: "User not found" });

    if (targetUser.role === "admin")
      return res.status(403).json({ error: "Cannot suspend an admin" });

    targetUser.status = "suspended";
    await targetUser.save();

    // 🔔 Notify manufacturer
    await saveNotification(
      targetUser._id.toString(),
      "message",
      "Account Suspended",
      "Your account has been suspended by the admin.",
      {}
    );

    if (targetUser.deviceTokens?.length > 0) {
      await sendPushNotification(
        targetUser.deviceTokens,
        "Account Suspended",
        "Your Rawsy manufacturer account has been suspended.",
        { type: "message" }
      );
    }

    return res.json({ message: "Manufacturer suspended", user: targetUser });

  } catch (err) {
    return res.status(500).json({ error: "Failed to suspend manufacturer" });
  }
};

// ---------------- ADMIN: DEACTIVATE MANUFACTURER ----------------
export const deleteManufacturer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const targetUser: any = await User.findById(id);
    if (!targetUser)
      return res.status(404).json({ error: "User not found" });

    if (targetUser.role === "admin")
      return res.status(403).json({ error: "Cannot deactivate an admin" });

    targetUser.status = "deactivated";
    await targetUser.save();

    // 🔔 Notify manufacturer
    await saveNotification(
      targetUser._id.toString(),
      "message",
      "Account Deactivated",
      "Your account has been deactivated by the admin.",
      {}
    );

    if (targetUser.deviceTokens?.length > 0) {
      await sendPushNotification(
        targetUser.deviceTokens,
        "Account Deactivated",
        "Your Rawsy manufacturer account has been deactivated.",
        { type: "message" }
      );
    }

    return res.json({ message: "Manufacturer deactivated", user: targetUser });

  } catch (err) {
    return res.status(500).json({ error: "Failed to deactivate manufacturer" });
  }
};

// ---------------- ADMIN: UNSUSPEND MANUFACTURER ----------------
export const unsuspendManufacturer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const targetUser: any = await User.findById(id);
    if (!targetUser)
      return res.status(404).json({ error: "Manufacturer not found" });

    targetUser.status = "active";
    await targetUser.save();

    // 🔔 Notify manufacturer
    await saveNotification(
      targetUser._id.toString(),
      "message",
      "Account Reactivated",
      "Your account has been reactivated by the admin.",
      {}
    );

    if (targetUser.deviceTokens?.length > 0) {
      await sendPushNotification(
        targetUser.deviceTokens,
        "Account Reactivated",
        "Your Rawsy manufacturer account is active again.",
        { type: "message" }
      );
    }

    return res.json({ message: "Manufacturer unsuspended", user: targetUser });

  } catch (err) {
    return res.status(500).json({ error: "Failed to unsuspend manufacturer" });
  }
};
// ---------------- UPDATE LANGUAGE ----------------
export const updateLanguage = async (req: Request, res: Response) => {
  try {
    const { language } = req.body;
    const user = (req as any).user;

    if (!["en", "am", "om"].includes(language))
      return res.status(400).json({ error: "Invalid language" });

    await User.findByIdAndUpdate(user.id, { language });

    return res.json({ message: "Language updated" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
