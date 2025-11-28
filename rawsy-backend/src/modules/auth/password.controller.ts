import { Request, Response } from "express";
import User from "./auth.model";
import bcrypt from "bcryptjs";

export const changePassword = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old and new password required" });
    }

    const userDoc: any = await User.findById(user.id).select("+password");
    if (!userDoc) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, userDoc.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect old password" });

    const hashed = await bcrypt.hash(newPassword, 10);
    userDoc.password = hashed;
    await userDoc.save();

    return res.json({ message: "Password changed successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
