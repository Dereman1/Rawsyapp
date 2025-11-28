import { Request, Response } from "express";
import User from "./auth.model";
import cloudinary from "../../config/cloudinary.config";

export const uploadVerificationDoc = async (req: Request, res: Response) => {
  try {
    console.log("=== DEBUG UPLOAD VERIFICATION START ===");
    
    const user = (req as any).user;
    console.log("1. User from auth:", user);
    console.log("2. User ID:", user?.id);

    const file = req.file; // Use req.file directly, not (req as any).file
    console.log("3. req.file:", file);
    console.log("4. req.file exists:", !!file);
    console.log("5. req.file type:", typeof file);
    
    if (file) {
      console.log("6. File details:", {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        bufferLength: file.buffer?.length,
        bufferType: typeof file.buffer
      });
    }

    console.log("7. req.body:", req.body);
    console.log("8. req.body type:", typeof req.body);
    console.log("9. req.body.type:", req.body.type);

    const docType = (req.body.type as string) || "business_doc";
    console.log("10. Document type:", docType);

    if (!file) {
      console.log("ERROR: No file uploaded - req.file is null/undefined");
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!file.buffer) {
      console.log("ERROR: File has no buffer");
      return res.status(400).json({ error: "File buffer is missing" });
    }

    console.log("11. Starting Cloudinary upload...");
    
    // Upload to Cloudinary
    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "rawsy_verification",
          resource_type: "auto"
        },
        (error, result) => {
          if (error) {
            console.error("12. Cloudinary upload error:", error);
            return reject(error);
          }
          console.log("13. Cloudinary upload success:", {
            url: result?.secure_url,
            public_id: result?.public_id
          });
          resolve(result);
        }
      );
      stream.end(file.buffer);
    });

    const fileUrl = uploadResult.secure_url;
    const filename = uploadResult.public_id;

    console.log("14. Cloudinary result:", {
      fileUrl,
      filename
    });

    // Create the document object first - let Mongoose set uploadedAt via default
    const newDoc = {
      url: fileUrl,
      filename: filename,
      type: docType,
      status: "pending" as const
    };

    console.log("15. Document to push:", newDoc);
    console.log("16. Document type:", typeof newDoc);

    // Debug: Check current user state before update
    const currentUser = await User.findById(user.id);
    console.log("17. Current user verificationDocs:", currentUser?.verificationDocs);
    console.log("18. Current user verificationDocs type:", typeof currentUser?.verificationDocs);

    console.log("19. Starting database update...");
    
    // Save to user
    const updated = await User.findByIdAndUpdate(
      user.id,
      {
        $push: {
          verificationDocs: newDoc
        }
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).select("-password");

    console.log("20. Database update completed");
    console.log("21. Updated user:", updated ? "Found" : "Not found");

    if (!updated) {
      console.log("ERROR: User not found after update");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("22. Updated user verificationDocs:", updated.verificationDocs);
    console.log("23. Updated user verificationDocs length:", updated.verificationDocs?.length);

    const lastDoc = Array.isArray(updated.verificationDocs) && updated.verificationDocs.length > 0
      ? updated.verificationDocs[updated.verificationDocs.length - 1]
      : null;

    console.log("24. Last document:", lastDoc);
    console.log("=== DEBUG UPLOAD VERIFICATION END ===");

    return res.json({
      message: "Verification document uploaded",
      doc: lastDoc,
      profile: updated
    });

  } catch (err: any) {
    console.error("25. FINAL CATCH ERROR:", err);
    console.error("26. Error name:", err.name);
    console.error("27. Error message:", err.message);
    console.error("28. Error stack:", err.stack);
    
    // Check if it's a MongoDB validation error
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      console.error("29. MongoDB Validation/Cast Error Details:");
      console.error("30. Error path:", (err as any).path);
      console.error("31. Error value:", (err as any).value);
      console.error("32. Error kind:", (err as any).kind);
    }
    
    return res.status(500).json({ 
      error: err.message || "Upload failed",
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};