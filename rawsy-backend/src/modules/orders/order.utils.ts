import Order from "./order.model";

export const addOrderLog = async (orderId: string, actorId: string, action: string, message: string) => {
  await Order.findByIdAndUpdate(orderId, {
    $push: {
      activityLogs: {
        action,
        message,
        actor: actorId,
        createdAt: new Date()
      }
    }
  });
};
