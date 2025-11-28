import { firebaseAdmin } from "../config/firebase.config";
import Notification from "../modules/notifications/notification.model";
import User from "../modules/auth/auth.model";
import { t } from "../utils/i18n";

/**
 * 🛎️ Send Push Notification
 */
export const sendPushNotification = async (
  deviceTokens: string[],
  title: string,
  body: string,
  data: Record<string, any> = {}
) => {
  try {
    if (!deviceTokens?.length) return;

    await firebaseAdmin.messaging().sendEachForMulticast({
      notification: { title, body },
      data,
      tokens: deviceTokens,
    });
  } catch (err) {
    console.error("🔥 Push Notification Error:", err);
  }
};

/**
 * 🌍 Get user language (Only buyers/manufacturers change language)
 */
const getUserLanguage = (user: any) => {
  if (!user) return "en";

  // 🎯 Suppliers ALWAYS get English
  if (user.role === "supplier") return "en";

  // 🎯 Manufacturer can choose
  return user.language || "en";
};

/**
 * 💾 Save Notification + Translate Automatically
 */
export const saveNotification = async (
  userId: string,
  type: string,
  titleKey: string,
  messageKey: string,
  data: Record<string, any> = {}
) => {
  try {
    const user = await User.findById(userId).select("role language deviceTokens");

    if (!user) return;

    const lang = getUserLanguage(user);

    const title = t(titleKey, lang);
    const message = t(messageKey, lang);

    await Notification.create({
      user: String(user._id),
      type,
      title,
      message,
      data,
    });

    if (user.deviceTokens?.length) {
      await sendPushNotification(user.deviceTokens, title, message, data);
    }
  } catch (err) {
    console.error("🔥 Save Notification Error:", err);
  }
};

/**
 * 🔔 Shortcut Helper
 */
export const notifyUser = async (
  user: any,
  type: string,
  titleKey: string,
  messageKey: string,
  data: Record<string, any> = {}
) => {
  if (!user) return;
  await saveNotification(String(user._id), type, titleKey, messageKey, data);
};

/**
 * 💘 Wishlist Auto Notifications (Localized)
 */
export const notifyWishlistUsers = async (
  product: any,
  change: { type: "price_drop" | "back_in_stock"; oldPrice?: number; newPrice?: number }
) => {
  try {
    const users = await User.find({ wishlist: product._id })
      .select("role language deviceTokens");

    if (!users.length) return;

    const data: any = { productId: String(product._id), ...change };

    for (const user of users) {
      await saveNotification(
        String(user._id),
        change.type,
        change.type,
        change.type,
        data
      );
    }
  } catch (err) {
    console.error("notifyWishlistUsers error:", err);
  }
};
