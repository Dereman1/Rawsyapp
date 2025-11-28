import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import User from "./auth.model";

const router = Router();

router.post("/save-device-token", authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const { deviceToken } = req.body;

    if (!deviceToken) {
      return res.status(400).json({ error: "deviceToken is required" });
    }

    await User.findByIdAndUpdate(user.id, {
      $addToSet: { deviceTokens: deviceToken }, // avoid duplicates
    });

    res.json({ message: "Device token saved" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
