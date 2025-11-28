import { Request, Response } from "express";
import Order from "./order.model";
import { formatInvoiceList, formatInvoiceSummary } from "./order.invoice.utils";

export const getInvoiceSummary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const order = await Order.findById(id)
      .populate("buyer", "name email phone")
      .populate("supplier", "name email phone")
      .populate("items.product", "name unit price");

    if (!order) return res.status(404).json({ error: "Order not found" });

    // Authorization: buyer OR supplier OR admin
    if (
      user.role !== "admin" &&
      order.buyer._id.toString() !== user.id &&
      order.supplier._id.toString() !== user.id
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    return res.json(formatInvoiceSummary(order));

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getMyInvoices = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const orders = await Order.find({ buyer: user.id }).select("reference total status createdAt");
    return res.json({ invoices: formatInvoiceList(orders) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getSupplierInvoices = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const orders = await Order.find({ supplier: user.id }).select("reference total status createdAt");
    return res.json({ invoices: formatInvoiceList(orders) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAllInvoicesAdmin = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const orders = await Order.find()
      .select("reference total status createdAt buyer supplier")
      .populate("buyer", "name email phone")
      .populate("supplier", "name email phone");

    return res.json({ invoices: formatInvoiceList(orders) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
