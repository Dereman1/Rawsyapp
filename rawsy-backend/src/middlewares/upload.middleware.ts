import multer from "multer";

const storage = multer.memoryStorage();

export const uploadSingle = (fieldName = "file") =>
  multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5 MB
    },
    fileFilter: (req, file, cb) => {
      const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf"
      ];

      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error("Only JPEG, PNG, WEBP images and PDF files are allowed") as any,
          false
        );
      }
    }
  }).single(fieldName);
