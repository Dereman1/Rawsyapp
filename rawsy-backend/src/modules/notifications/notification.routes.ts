import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { getMyNotifications, markAsRead, markAllAsRead } from "./notification.controller";

const router = Router();

router.get("/", authenticate, getMyNotifications);
router.put("/:id/read", authenticate, markAsRead);
router.put("/read/all", authenticate, markAllAsRead);

export default router;
