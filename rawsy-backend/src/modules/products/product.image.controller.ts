import { Request, Response } from "express";
import cloudinary from "../../config/cloudinary.config";
import Product from "./product.model";

export const deleteProductImage = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const productId = req.params.id;
    const imageId = req.query.imageId as string; // rawsy_products/xxxxx

    if (!imageId) {
      return res.status(400).json({ error: "Image publicId is required" });
    }
    if (!imageId.startsWith("rawsy_products/")) {
  return res.status(400).json({ error: "Invalid publicId format" });
    }
    // 1) Find product & verify ownership
    const product: any = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // 🔐 Supplier can only modify their own product
    if (product.supplier.toString() !== user.id) {
      return res.status(403).json({ error: "Not allowed. Not your product." });
    }

    // 2) Remove from Cloudinary
    await cloudinary.uploader.destroy(imageId);

    // 3) Remove from MongoDB images array
    product.images = product.images.filter((img: string) => !img.includes(imageId));

    // 4) Update thumbnail (if deleted)
    if (product.thumbnail && product.thumbnail.includes(imageId)) {
      product.thumbnail = product.images.length > 0 ? product.images[0] : null;
    }

    await product.save();

    return res.json({
      message: "Image deleted successfully",
      updatedThumbnail: product.thumbnail,
      remainingImages: product.images
    });

  } catch (err: any) {
    console.log(err);
    return res.status(500).json({ error: err.message || "Image deletion failed" });
  }
};
