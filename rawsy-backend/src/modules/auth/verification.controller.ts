import { Request, Response } from "express";
import User from "./auth.model";
import cloudinary from "../../config/cloudinary.config";

export const uploadVerificationDoc = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const file = req.file;
    const docType = req.body.type || "business_doc";

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!file.buffer) {
      return res.status(400).json({ error: "File buffer is missing" });
    }

    // Upload to Cloudinary
    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "rawsy_verification",
          resource_type: "auto"
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      stream.end(file.buffer);
    });

    const fileUrl = uploadResult.secure_url;
    const filename = uploadResult.public_id;

    // Use findByIdAndUpdate with $addToSet to add document
    const updated = await User.findByIdAndUpdate(
      user.id,
      {
        $addToSet: {
          verificationDocs: {
            url: fileUrl,
            filename: filename,
            type: docType,
            status: "pending"
          }
        }
      },
      {
        new: true,
        runValidators: false
      }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    const lastDoc = updated.verificationDocs && updated.verificationDocs.length > 0
      ? updated.verificationDocs[updated.verificationDocs.length - 1]
      : null;

    return res.json({
      message: "Verification document uploaded",
      doc: lastDoc,
      profile: updated
    });

  } catch (err: any) {
    console.error("Upload verification error:", err);

    return res.status(500).json({
      error: err.message || "Upload failed"
    });
  }
};