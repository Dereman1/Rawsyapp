import { Request, Response } from "express";
import User from "../auth/auth.model";
import Product from "../products/product.model";

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const userData = await User.findById(user.id);

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userData.wishlist.includes(productId)) {
      return res.status(400).json({ error: "Product already in wishlist" });
    }

    userData.wishlist.push(productId);
    await userData.save();

    return res.json({ message: "Product added to wishlist", wishlist: userData.wishlist });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};


export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { productId } = req.body;

    const userData = await User.findById(user.id);

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    userData.wishlist = userData.wishlist.filter((id: any) => id.toString() !== productId);
    await userData.save();

    return res.json({ message: "Removed from wishlist", wishlist: userData.wishlist });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};


export const getWishlist = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const userData = await User.findById(user.id).populate("wishlist");

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ wishlist: userData.wishlist });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
