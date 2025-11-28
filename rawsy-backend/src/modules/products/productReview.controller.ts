import { Request, Response } from "express";
import Product from "./product.model";
import ProductReview from "./productReview.model";
import Order from "../orders/order.model";

export const addProductReview = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { productId, rating, comment } = req.body;

    if (!rating) return res.status(400).json({ error: "Rating is required" });

    // Must have bought the product & delivered
    const hasBought = await Order.findOne({
      buyer: user.id,
      "items.product": productId,
      status: "delivered"
    });

    if (!hasBought) {
      return res.status(403).json({
        error: "You can only review products you have purchased and received"
      });
    }

    // Prevent duplicate review
    const existingReview = await ProductReview.findOne({
      product: productId,
      buyer: user.id
    });

    if (existingReview) {
      return res.status(400).json({ error: "You already reviewed this product" });
    }

    // Save review
    await ProductReview.create({
      product: productId,
      buyer: user.id,
      rating,
      comment
    });

    // Update product rating
    const allReviews = await ProductReview.find({ product: productId });
    const totalCount = allReviews.length;
    const averageRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / totalCount;

    await Product.findByIdAndUpdate(productId, {
      $set: {
        "rating.average": averageRating,
        "rating.count": totalCount
      }
    });

    return res.json({ message: "Review added!" });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const reviews = await ProductReview.find({ product: productId })
      .populate("buyer", "name");

    return res.json({ reviews });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
