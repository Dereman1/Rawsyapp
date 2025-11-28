import { Request, Response, NextFunction } from "express";

export const blockSuspendedUsers = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (user.status === "deactivated") {
    return res.status(403).json({
      error: "Your account is deactivated and cannot access the system."
    });
  }

  if (user.status === "suspended") {
    return res.status(403).json({
      error: "Your account is suspended. You cannot place orders."
    });
  }

  next();
};
