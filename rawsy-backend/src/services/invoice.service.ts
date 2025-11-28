import PDFDocument from "pdfkit";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import qr from "qr-image";

export const generateInvoicePDF = async (
  order: any,
  type: "buyer" | "supplier"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure invoices folder exists
      if (!existsSync("./invoices")) {
        mkdirSync("./invoices");
      }

      const doc = new PDFDocument({ margin: 50 });

      const filePath = `./invoices/${order.reference}.pdf`;
      const stream = createWriteStream(filePath);
      doc.pipe(stream);

      // Invoice Header
      const headerText = type === "buyer" ? "Buyer Invoice" : "Supplier Invoice";

      doc
        .fontSize(26)
        .text("RAWsy", { align: "center" })
        .moveDown(0.3);

      doc
        .fontSize(18)
        .text(headerText, { align: "center" })
        .moveDown(1);

      // Invoice Basic Info
      doc.fontSize(12).text(`Invoice Number: ${order.reference}`);
      doc.text(`Order Status: ${order.status}`);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
      doc.moveDown(1);

      // Buyer Info
      doc.fontSize(14).text("Buyer Information:", { underline: true });
      doc.fontSize(12).text(`Name: ${order.buyer.name}`);
      doc.text(`Email: ${order.buyer.email}`);
      doc.text(`Phone: ${order.buyer.phone}`);
      doc.moveDown(1);

      // Supplier Info
      doc.fontSize(14).text("Supplier Information:", { underline: true });
      doc.fontSize(12).text(`Name: ${order.supplier.name}`);
      doc.text(`Email: ${order.supplier.email}`);
      doc.text(`Phone: ${order.supplier.phone}`);
      doc.moveDown(1);

      // Delivery Info
      if (order.delivery) {
        doc.fontSize(14).text("Delivery Information:", { underline: true });
        doc.fontSize(12).text(`Address: ${order.delivery.address || "-"}`);
        doc.text(`Contact: ${order.delivery.contactName || "-"}`);
        doc.text(`Phone: ${order.delivery.contactPhone || "-"}`);
        doc.moveDown(1);
      }

      // Tracking Info
      if (order.trackingNumber) {
        doc.fontSize(14).text("Tracking Information:", { underline: true });
        doc.fontSize(12).text(`Tracking Number: ${order.trackingNumber}`);
        doc.text(
          `Expected Delivery: ${
            order.expectedDeliveryDate
              ? new Date(order.expectedDeliveryDate).toLocaleDateString()
              : "-"
          }`
        );
        doc.moveDown(1);
      }

      // Items
      doc.fontSize(14).text("Order Items:", { underline: true }).moveDown(0.5);

      order.items.forEach((item: any, index: number) => {
        doc
          .fontSize(12)
          .text(
            `${index + 1}. ${item.name} — ${item.quantity} ${
              item.unit
            } × ${item.unitPrice} ETB = ${item.subtotal} ETB`
          );
      });

      doc.moveDown(1);

      // Total
      doc.fontSize(16).text(`Total: ${order.total} ETB`, { align: "right" });

      doc.moveDown(2);

      // QR Code
      const qrPng = qr.imageSync(order.reference, { type: "png" });
      doc.image(qrPng, 50, doc.y, { width: 100 });

      doc.end();

      stream.on("finish", () => resolve(filePath));
    } catch (err) {
      reject(err);
    }
  });
};
