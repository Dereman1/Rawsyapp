import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  requestQuote,
  listMyQuotes,
  listReceivedQuotes,
  respondToQuote,
  convertQuoteToOrder,
  buyerActionOnQuote
} from "./quote.controller";

const router = Router();

// Buyer requests a quote
router.post("/request", authenticate, requestQuote);

// Buyer lists their quotes
router.get("/mine", authenticate, listMyQuotes);

// Supplier lists received quotes
router.get("/received", authenticate, listReceivedQuotes);

// Supplier respond (counter/accept/reject)
router.put("/:id/respond", authenticate, respondToQuote);

// Buyer accepts supplier offer OR cancels quote
router.put("/:id/buyer-action", authenticate, buyerActionOnQuote);

// Buyer converts a priced/accepted quote to order
router.post("/:id/convert", authenticate, convertQuoteToOrder);

export default router;
