import { Request, Response } from "express";
import FAQ from "./faq.model";

/* Public: list FAQs (optionally filter by tag) */
export const listFaqs = async (req: Request, res: Response) => {
  try {
    const { tag } = req.query;
    const q: any = { visible: true };
    if (tag) q.tags = tag;
    const faqs = await FAQ.find(q).sort({ createdAt: -1 });
    return res.json({ faqs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

/* Admin: create FAQ */
export const createFaq = async (req: Request, res: Response) => {
  try {
    const { question, answer, tags = [], visible = true } = req.body;
    if (!question || !answer) return res.status(400).json({ error: "question & answer required" });
    const faq = await FAQ.create({ question, answer, tags, visible });
    return res.json({ message: "FAQ created", faq });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

/* Admin: update FAQ */
export const updateFaq = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await FAQ.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "FAQ not found" });
    return res.json({ message: "FAQ updated", faq: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

/* Admin: delete FAQ */
export const deleteFaq = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await FAQ.findByIdAndDelete(id);
    return res.json({ message: "FAQ deleted" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
