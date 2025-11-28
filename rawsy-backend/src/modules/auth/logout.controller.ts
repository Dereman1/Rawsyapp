import { Request, Response } from "express";
import RevokedToken from "../../models/revokedToken.model";
import jwt from "jsonwebtoken";

export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) return res.status(400).json({ error: "No token provided" });

    const decoded: any = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return res.status(400).json({ error: "Invalid token" });
    }

    // Save to revoked collection, TTL uses token exp
    const expiresAt = new Date(decoded.exp * 1000);
    await RevokedToken.create({ token, expiresAt });

    return res.json({ message: "Logged out (token invalidated)" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
