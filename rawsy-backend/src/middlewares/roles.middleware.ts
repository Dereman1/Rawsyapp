import { Request, Response, NextFunction } from "express";

export const requireRole = (roles: string | string[]) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (!allowed.includes(user.role)) return res.status(403).json({ error: "Access denied" });
    next();
  };
};
