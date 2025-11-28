import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import {
  createTicket,
  getMyTickets,
  adminGetAllTickets,
  adminRespondTicket
} from "./ticket.controller";
import { listFaqs, createFaq, updateFaq, deleteFaq } from "./faq.controller";
import { broadcastUpdate } from "./broadcast.controller";
import { uploadSingle } from "../../middlewares/upload.middleware";

const router = Router();

// 📌 FAQ (public)
router.get("/faq", listFaqs);

// 📌 User submits ticket + attachment
router.post(
  "/ticket",
  authenticate,
  (req, res, next) =>
    uploadSingle("attachment")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    }),
  createTicket
);

// 📌 User sees their tickets
router.get("/ticket/mine", authenticate, getMyTickets);

// 📌 Admin: list all tickets
router.get("/ticket/admin/all", authenticate, requireRole("admin"), adminGetAllTickets);

// 📌 Admin responds + optional attachment
router.put(
  "/ticket/admin/respond/:id",
  authenticate,
  requireRole("admin"),
  (req, res, next) =>
    uploadSingle("attachment")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    }),
  adminRespondTicket
);

// 📌 Admin FAQ & Broadcast
router.post("/faq", authenticate, requireRole("admin"), createFaq);
router.put("/faq/:id", authenticate, requireRole("admin"), updateFaq);
router.delete("/faq/:id", authenticate, requireRole("admin"), deleteFaq);
router.post("/broadcast", authenticate, requireRole("admin"), broadcastUpdate);

export default router;
