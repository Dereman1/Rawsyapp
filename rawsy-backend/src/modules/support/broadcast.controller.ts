import { Request, Response } from "express";
import User from "../auth/auth.model";
import { saveNotification, sendPushNotification } from "../../services/notification.service";

/**
 * POST /api/support/broadcast
 * Body: { title, message, targetRole? ("manufacturer"|"supplier"|"all") }
 */
export const broadcastUpdate = async (req: Request, res: Response) => {
  try {
    const { title, message, targetRole } = req.body;
    if (!title || !message) return res.status(400).json({ error: "title & message required" });

    // choose recipients
    const query: any = {};
    if (targetRole && targetRole !== "all") query.role = targetRole;

    const users = await User.find(query).select("_id deviceTokens");

    // Save notifications (bulk)
    const bulkOps = users.map(u => ({
      insertOne: {
        document: {
          user: u._id,
          title,
          message,
          type: "message",
          data: {},
          read: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    }));

    // If Notification model is available, use insertMany / bulkWrite.
    // For simplicity call saveNotification per user (ensures hooks etc).
    for (const u of users) {
      await saveNotification(String(u._id), "message", title, message, {});
    }

    // Push: collect tokens & send in batches
    const allTokens = users.flatMap((u: any) => u.deviceTokens || []);
    if (allTokens.length > 0) {
      await sendPushNotification(allTokens, title, message, { type: "platform_broadcast" });
    }

    return res.json({ message: "Broadcast sent", recipients: users.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
