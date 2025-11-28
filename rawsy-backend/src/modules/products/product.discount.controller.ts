import { Request, Response } from "express";
import Product from "./product.model";
import User from "../auth/auth.model";
import { saveNotification, sendPushNotification } from "../../services/notification.service";

// Supplier adds/updates discount
export const applyDiscount = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { productId, percentage, expiresAt } = req.body;

    if (!percentage || percentage < 1 || percentage > 90) {
      return res.status(400).json({ error: "Discount must be between 1–90%" });
    }

    const product: any = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.supplier.toString() !== user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    product.discount = {
      percentage,
      active: true,
      expiresAt: expiresAt || null
    };
    await product.save();

    // Notify wishlist users
    const users = await User.find({ wishlist: productId });
    for (const u of users) {
      await saveNotification(
        u._id.toString(),
        "discount_started",
        "discount_started",
        `${product.name} is now ${percentage}% off!`,
        { productId }
      );

      if (u.deviceTokens?.length > 0) {
        await sendPushNotification(
          u.deviceTokens,
          "🔥 Limited Discount!",
          `${product.name} is now ${percentage}% off!`,
          { productId, type: "discount_started" }
        );
      }
    }

    res.json({ message: "Discount applied successfully", product });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Supplier removes discount
export const removeDiscount = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { productId } = req.params;

    const product: any = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.supplier.toString() !== user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    product.discount = { percentage: 0, active: false, expiresAt: null };
    await product.save();

    res.json({ message: "Discount removed", product });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
