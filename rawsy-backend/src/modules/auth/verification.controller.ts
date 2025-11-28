import { Request, Response } from "express";
import User from "./auth.model";
import cloudinary from "../../config/cloudinary.config"; // existing
import { createWriteStream, existsSync, mkdirSync } from "fs";
import path from "path";

export const uploadVerificationDoc = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const file: any = (req as any).file; // multer buffer
    const docType = (req.body.type as string) || "business_doc"; // type: id, license, tax, etc.

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // Option A - Upload to Cloudinary (supports pdf & images)
    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "rawsy_verification",
          resource_type: "auto" // auto to allow pdf + images
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(file.buffer);
    });

    const fileUrl = uploadResult.secure_url;
    const filename = uploadResult.public_id; // e.g. rawsy_verification/xxxxx

    // Save to user
    const updated = await User.findByIdAndUpdate(
      user.id,
      {
        $push: {
          verificationDocs: {
            url: fileUrl,
            filename,
            type: docType,
            status: "pending",
            uploadedAt: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    const lastDoc =
      Array.isArray(updated.verificationDocs) && updated.verificationDocs.length > 0
        ? updated.verificationDocs[updated.verificationDocs.length - 1]
        : null;

    return res.json({
      message: "Verification document uploaded",
      doc: lastDoc,
      profile: updated
    });
  } catch (err: any) {
    console.error("uploadVerificationDoc error:", err);
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
};
