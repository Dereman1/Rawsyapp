import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../orders/order.model";
import User from "../auth/auth.model";
import Product from "../products/product.model";

/**
 * Helper: get start date for N months ago (beginning of that month)
 */
const getStartDateMonthsAgo = (months: number) => {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getOverview = async (req: Request, res: Response) => {
  try {
    const months = 6; // last 6 months as required
    const startDate = getStartDateMonthsAgo(months);

    // users
    const totalManufacturers = await User.countDocuments({ role: "manufacturer", status: { $ne: "deactivated" } });
    const totalSuppliers = await User.countDocuments({ role: "supplier", status: "approved" });
    const pendingSuppliers = await User.countDocuments({ role: "supplier", status: "pending" });
    const activeSuppliers = await User.countDocuments({ role: "supplier", status: "approved" });

    // orders and revenue (since startDate)
    const orderMatch = { createdAt: { $gte: startDate } };
    const ordersAggregate = await Order.aggregate([
      { $match: orderMatch },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          revenue: { $sum: "$total" }
        }
      }
    ]);

    const totalOrders = ordersAggregate[0]?.totalOrders || 0;
    const revenue = ordersAggregate[0]?.revenue || 0;

    return res.json({
      overview: {
        totalManufacturers,
        totalSuppliers,
        pendingSuppliers,
        activeSuppliers,
        totalOrders,
        revenue
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getTopSuppliers = async (req: Request, res: Response) => {
  try {
    const months = 6;
    const startDate = getStartDateMonthsAgo(months);
    const limit = Number(req.query.limit || 5);

    // Aggregate orders by supplier: count orders and sum revenue
    const agg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$supplier",
          orderCount: { $sum: 1 },
          revenue: { $sum: "$total" }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "supplier"
        }
      },
      { $unwind: "$supplier" },
      {
        $project: {
          supplierId: "$_id",
          supplierName: "$supplier.name",
          supplierEmail: "$supplier.email",
          orderCount: 1,
          revenue: 1
        }
      }
    ]);

    return res.json({ topSuppliers: agg });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const months = 6;
    const startDate = getStartDateMonthsAgo(months);
    const limit = Number(req.query.limit || 10);

    // Top products by ordered quantity (unwind items)
    const byOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          orderedQty: { $sum: "$items.quantity" },
          timesOrdered: { $sum: 1 }
        }
      },
      { $sort: { orderedQty: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          productId: "$_id",
          name: "$product.name",
          sku: "$product.sku",
          orderedQty: 1,
          timesOrdered: 1
        }
      }
    ]);

    // Top products by wishlist count (across users)
    const wishlistAgg = await User.aggregate([
      { $unwind: "$wishlist" },
      { $group: { _id: "$wishlist", wishlistCount: { $sum: 1 } } },
      { $sort: { wishlistCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          productId: "$_id",
          name: "$product.name",
          wishlistCount: 1
        }
      }
    ]);

    return res.json({ topByOrders: byOrders, topByWishlist: wishlistAgg });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getTrends = async (req: Request, res: Response) => {
  try {
    const months = Number(req.query.months || 6);
    const startDate = getStartDateMonthsAgo(months);

    // revenue per month
    const revenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          revenue: 1,
          orders: 1
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    // build labels & values for last N months (even if some months missing)
    const now = new Date();
    const labels: string[] = [];
    const revenueValues: number[] = [];
    const ordersValues: number[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short" });
      labels.push(label);

      const match = revenueAgg.find((r: any) => r.year === d.getFullYear() && r.month === d.getMonth() + 1);
      revenueValues.push(match ? match.revenue : 0);
      ordersValues.push(match ? match.orders : 0);
    }

    return res.json({
      revenueChart: { labels, values: revenueValues },
      ordersChart: { labels, values: ordersValues }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
