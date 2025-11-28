import { Request, Response } from "express";
import User from "../auth/auth.model";

export const updateFactoryOrBusinessLocation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { address, placeName, contactName, contactPhone, lat, lng } = req.body;

    if (!address || !contactName || !contactPhone || !lat || !lng) {
      return res.status(400).json({
        error: "address, contactName, contactPhone, lat, and lng are required"
      });
    }

    const user: any = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const locationData = {
      address,
      placeName: placeName || "",
      contactName,
      contactPhone,
      coordinates: { lat, lng }
    };

    // ⭐ Manufacturer → factoryLocation
    if (user.role === "manufacturer") {
      user.factoryLocation = locationData;
    }

    // ⭐ Supplier → businessLocation
    else if (user.role === "supplier") {
      user.businessLocation = locationData;
    }

    await user.save();

    return res.json({
      message: "Location updated successfully",
      location:
        user.role === "manufacturer" ? user.factoryLocation : user.businessLocation
    });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
