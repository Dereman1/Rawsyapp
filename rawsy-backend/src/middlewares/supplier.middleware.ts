import { Request, Response, NextFunction } from "express";

export const requireApprovedSupplier = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (user.role !== "supplier") {
    return res.status(403).json({ error: "Only suppliers can access this route" });
  }

  if (user.status === "pending") {
    return res.status(403).json({ error: "Your supplier account is still pending approval" });
  }

  if (user.status === "rejected") {
    return res.status(403).json({ error: "Your supplier application was rejected" });
  }

  next();
};
