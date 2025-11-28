export const getStatusBadge = (status: string) => {
  const map: any = {
    placed:      { label: "Order Placed",       color: "#6B7280", progress: 1 },
    confirmed:   { label: "Confirmed",          color: "#2563EB", progress: 2 },
    in_transit:  { label: "In Transit",         color: "#3B82F6", progress: 3 },
    delivered:   { label: "Delivered",          color: "#10B981", progress: 4 },
    rejected:    { label: "Rejected",           color: "#EF4444", progress: 0 },
    cancelled:   { label: "Cancelled",          color: "#F59E0B", progress: 0 },
  };

  return map[status] || { label: "Unknown", color: "#6B7280", progress: 0 };
};


export const mapOrderTimeline = (order: any) => {
  const t = order.deliveryTimeline || {};

  return [
    { step: "Placed",    at: t.placedAt || null },
    { step: "Confirmed", at: t.confirmedAt || null },
    { step: "Shipped",   at: t.shippedAt || null },
    { step: "Delivered", at: t.deliveredAt || null }
  ];
};
