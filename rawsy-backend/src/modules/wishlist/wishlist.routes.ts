import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { addToWishlist, removeFromWishlist, getWishlist } from "./wishlist.controller";
import { getPopularProducts } from "./wishlist.analytics";

const router = Router();

// Only manufacturers can use wishlist
function requireManufacturer(req: any, res: any, next: any) {
  if (req.user.role !== "manufacturer") {
    return res.status(403).json({ error: "Only manufacturers can use wishlist" });
  }
  next();
}

router.post("/add", authenticate, requireManufacturer, addToWishlist);
router.post("/remove", authenticate, requireManufacturer, removeFromWishlist);
router.get("/list", authenticate, requireManufacturer, getWishlist);
router.get("/popular", authenticate, getPopularProducts);
export default router;
