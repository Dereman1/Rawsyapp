export const formatInvoiceList = (orders: any[]) => {
  return orders.map((o: any) => ({
    orderId: o._id,
    reference: o.reference,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt,
    invoiceFile: `/invoices/${o.reference}.pdf`, // ALWAYS SAME LOGIC
  }));
};

export const formatInvoiceSummary = (order: any) => ({
  reference: order.reference,
  createdAt: order.createdAt,
  status: order.status,

  buyer: order.buyer,
  supplier: order.supplier,
  items: order.items,
  total: order.total,

  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,

  trackingNumber: order.trackingNumber,
  expectedDeliveryDate: order.expectedDeliveryDate,
});
