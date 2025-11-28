import { Request, Response } from "express";
import User from "../auth/auth.model";
import { saveNotification, sendPushNotification } from "../../services/notification.service";
// ⭕ APPROVE SUPPLIER
export const approveSupplier = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "Supplier not found" });

    if (user.role !== "supplier") {
      return res.status(400).json({ error: "Only suppliers can be approved" });
    }

    user.status = "approved";
    await user.save();
    await saveNotification(
      user._id.toString(),
      "message",
      "Account Approved",
      "Your supplier account has been approved by admin.",
      {}
    );
    if (user.deviceTokens && user.deviceTokens.length > 0) {
      await sendPushNotification(
        user.deviceTokens,
        "Supplier Approved",
        "Your supplier account is now active.",
        { type: "message" }
      );
    }

    return res.json({ message: "Supplier approved successfully", user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// ❌ REJECT SUPPLIER
export const rejectSupplier = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ error: "Supplier not found" });
    if (user.role !== "supplier") {
      return res.status(400).json({ error: "Only suppliers can be rejected" });
    }

    user.status = "rejected";
    user.verifiedSupplier = false;
    await user.save();
     await saveNotification(
      user._id.toString(),
      "message",
      "Account Rejected",
      "Your supplier registration was rejected by admin.",
      {}
    );

    if (user.deviceTokens && user.deviceTokens.length > 0) {
      await sendPushNotification(
        user.deviceTokens,
        "Registration Rejected",
        "Your supplier account request was rejected.",
        { type: "message" }
      );
    }
    return res.json({ message: "Supplier rejected successfully", user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// ⭐ VERIFY SUPPLIER (TRUST BADGE)
export const verifySupplier = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "Supplier not found" });

    if (user.role !== "supplier")
      return res.status(400).json({ error: "Only suppliers can be verified" });

    if (user.status !== "approved")
      return res.status(400).json({ error: "Supplier must be approved first" });

    user.verifiedSupplier = true;
    await user.save();
     await saveNotification(
      user._id.toString(),
      "message",
      "Supplier Verified",
      "You have received a verified badge from Rawsy.",
      {}
    );

    if (user.deviceTokens && user.deviceTokens.length > 0) {
      await sendPushNotification(
        user.deviceTokens,
        "Verified Supplier",
        "Congratulations! You are now a verified supplier.",
        { type: "message" }
      );
    }
    return res.json({ message: "Supplier verified successfully", user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
