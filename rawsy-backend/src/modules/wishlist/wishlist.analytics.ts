import { Request, Response } from "express";
import User from "../auth/auth.model";
import Product from "../products/product.model";

export const getPopularProducts = async (req: Request, res: Response) => {
  try {
    // Aggregate popularity based on wishlist counts
    const popularity = await User.aggregate([
      { $unwind: "$wishlist" },
      { $group: { _id: "$wishlist", count: { $sum: 1 } } },
      { $sort: { count: -1 } },  // high to low
      { $limit: 20 }             // top 20 products
    ]);

    // fetch product details
    const productIds = popularity.map((p: any) => p._id);

    const products = await Product.find({ _id: { $in: productIds } })
      .populate("supplier", "name email phone");

    // merge results
    const response = popularity.map((p: any) => {
      const product = products.find((x: any) => x._id.toString() === p._id.toString());
      return {
        productId: p._id,
        name: product?.name,
        unit: product?.unit,
        price: product?.price,
        supplier: product?.supplier,
        wishlistCount: p.count
      };
    });

    return res.json({ popularProducts: response });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
