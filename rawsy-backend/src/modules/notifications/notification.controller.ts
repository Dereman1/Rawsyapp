import { Request, Response } from "express";
import Notification from "./notification.model";

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const notifications = await Notification.find({ user: user.id })
      .sort({ createdAt: -1 });

    return res.json({ notifications });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const notification = await Notification.findOne({ _id: id, user: user.id });

    if (!notification)
      return res.status(404).json({ error: "Notification not found" });

    notification.read = true;
    await notification.save();

    return res.json({ message: "Notification marked as read" });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    await Notification.updateMany({ user: user.id }, { read: true });

    return res.json({ message: "All notifications marked as read" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
