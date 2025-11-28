import { Request, Response } from "express";
import Ticket from "./ticket.model";
import User from "../auth/auth.model";
import { saveNotification, sendPushNotification } from "../../services/notification.service";

/* 📌 Create ticket (buyer or supplier) */
export const createTicket = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { subject, message } = req.body;

    if (!subject || !message)
      return res.status(400).json({ error: "subject & message required" });

    // 📎 Handle uploaded attachment (optional)
    const attachment = req.file
      ? {
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          url: `tickets/${Date.now()}-${req.file.originalname}` // TODO: upload to cloud storage
        }
      : null;

    const ticket = await Ticket.create({
      user: user.id,
      subject,
      message,
      attachments: attachment ? [attachment] : []
    });

    // 🔔 Notify user (ticket received)
    await saveNotification(
      user.id,
      "ticket_created",
      "Support Ticket Submitted",
      `Your ticket "${subject}" was submitted.`,
      { ticketId: ticket._id.toString() }
    );

    return res.json({ message: "Ticket submitted", ticket });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

/* 📌 Get user's tickets */
export const getMyTickets = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const tickets = await Ticket.find({ user: user.id }).sort({ createdAt: -1 });
    return res.json({ tickets });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

/* 📌 Admin: list all tickets */
export const adminGetAllTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await Ticket.find()
      .populate("user", "name email phone role")
      .sort({ createdAt: -1 });
    return res.json({ tickets });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

/* 📌 Admin: respond or resolve ticket + optional attachment */
export const adminRespondTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reply, status } = req.body; // status may be "in_progress" or "resolved"

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (reply) ticket.adminReply = reply;
    if (status) ticket.status = status;

    // 📎 Add attachment if provided
    if (req.file) {
      const newAttachment = {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        url: `tickets/${Date.now()}-${req.file.originalname}` // TODO: upload storage
      };
      ticket.adminAttachments = ticket.adminAttachments || [];
      ticket.adminAttachments.push(newAttachment);
    }

    // Mark resolved time if closed
    if (ticket.status === "resolved") {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();

    // Get user
    const user: any = await User.findById(ticket.user);

    // 🔔 Choose notification type
    const type = ticket.status === "resolved" ? "ticket_resolved" : "ticket_replied";
    const title = ticket.status === "resolved" ? "Ticket Resolved" : "Support Update";

    // Save Notification
    await saveNotification(
      String(user._id),
      type,
      title,
      reply ? `Admin: ${reply}` : "Your support ticket was updated",
      { ticketId: ticket._id.toString() }
    );

    // Send push if available
    if (user.deviceTokens && user.deviceTokens.length > 0) {
      await sendPushNotification(
        user.deviceTokens,
        title,
        reply || "Your support ticket was updated",
        { ticketId: ticket._id.toString(), type }
      );
    }

    return res.json({ message: "Response saved", ticket });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
