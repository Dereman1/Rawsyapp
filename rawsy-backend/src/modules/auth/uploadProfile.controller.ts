import { Request, Response } from "express";
import User from "./auth.model";
import cloudinary from "../../config/cloudinary.config";

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const file = (req as any).file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // Upload to Cloudinary
    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "rawsy_profiles",
          resource_type: "image",
          transformation: [{ quality: "auto" }, { fetch_format: "auto" }]
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(file.buffer);
    });

    // Update user profile image
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { profileImage: uploadResult.secure_url },
      { new: true }
    ).select("-password");

    return res.json({
      message: "Profile image updated",
      profileImage: uploadResult.secure_url,
      profile: updatedUser
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
};
