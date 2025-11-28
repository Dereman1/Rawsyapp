import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { getManufacturerHome, getSupplierDashboard } from "./home.controller";

const router = Router();

router.get("/manufacturer", authenticate, requireRole("manufacturer"), getManufacturerHome);
router.get("/supplier", authenticate, requireRole("supplier"), getSupplierDashboard);

export default router;
