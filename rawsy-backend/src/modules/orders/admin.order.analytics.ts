import { Request, Response } from "express";
import Order from "./order.model";

export const getOrderAnalytics = async (req: Request, res: Response) => {
  try {
    const totalOrders = await Order.countDocuments();

    const statusCounts = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const revenue = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    return res.json({
      totalOrders,
      statusCounts,
      totalRevenue: revenue.length ? revenue[0].total : 0,
      todayOrders
    });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
