import { Request, Response } from "express";
import cloudinary from "../../config/cloudinary.config";
import Product from "./product.model";

export const uploadProductImage = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    const productId = req.params.id;

    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (!productId) return res.status(400).json({ error: "Product id is required" });

    // Upload via Cloudinary stream
    const streamUpload = (buffer: Buffer) => {
      return new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "rawsy_products",
            resource_type: "image",
            overwrite: false,
            transformation: [{ quality: "auto" }, { fetch_format: "auto" }]
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(buffer);
      });
    };

    const result: any = await streamUpload(file.buffer);
    const imageUrl = result.secure_url;

    // Find product
    const product: any = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Push into images array
    product.images.push(imageUrl);

    // If no thumbnail image yet → set first image
    if (!product.image) {
      product.image = imageUrl;
    }

    await product.save();

    return res.json({
      message: "Image uploaded",
      imageUrl,
      product
    });

  } catch (err: any) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
};
