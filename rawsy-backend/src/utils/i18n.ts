// src/utils/i18n.ts

const translations: Record<string, { en: string; am: string; om: string }> = {
  // 🛒 Order Notifications
  order_placed: {
    en: "Your order has been placed",
    am: "ትዕዛዝህ ተሰጥቷል",
    om: "ajajni keessan kennameera"
  },
  order_confirmed: {
    en: "Your order has been confirmed",
    am: "ትዕዛዝዎ ተረጋግጧል",
    om: "Ajajni keessan mirkanaa'eera"
  },
  order_rejected: {
    en: "Your order was rejected",
    am: "ትዕዛዝዎ ተከልክሏል",
    om: "Ajajni keessan fudhatama dhabe"
  },

  order_in_transit: {
    en: "Your order is on the way",
    am: "ትዕዛዝዎ በመንገድ ላይ ነው",
    om: "Ajajni keessan karaa irra jira"
  },
  order_delivered: {
    en: "Your order has been delivered",
    am: "ትዕዛዝዎ ደርሷል",
    om: "Ajajni keessan isiniif dhiyaateera"
  },
  payment_completed: {
    en: "Payment confirmed",
    am: "ክፍያዎ ተረጋግጧል",
    om: "Kaffaltiin mirkanaa'eera"
  },

  // 💬 Quote Notifications
  
  quote_countered: {
    en: "Supplier sent a counter offer",
    am: "አቅራቢ ተፈጻሚ ቅናሽ አስተዋይ አቀረበ",
    om: "Dhiyeessaan dhiyeessii kaawuntarii erge"
  },
  quote_accepted: {
    en: "Your quote has been accepted",
    am: "የተጠየቀው ቅናሽ ተቀባይነት አግኝቷል",
    om: "Kootiin kee ni fudhatame"
  },
  quote_rejected: {
    en: "Your quote was rejected",
    am: "የተጠየቀው ቅናሽ ተከልክሏል",
    om: "Kootiin kee ni haquame"
  },
  quote_buyer_accepted: {
    en: "Buyer agreed to your quote",
    am: "ገዢው ከስምምነትዎ ጋር ተስማምቷል",
    om: "Maamilaan kootii kee fudhate"
  },
  quote_converted: {
    en: "Quote converted to order",
    am: "ቅናሽ ወደ ትዕዛዝ ተለውጧል",
    om: "Kootiin gara ajajaatti jijjiirame"
  },

  // 📦 Product & Stock
  price_drop: {
    en: "Price dropped",
    am: "ዋጋ ቀንሷል",
    om: "Gatiin gadi bu’e"
  },
  back_in_stock: {
    en: "Item is back in stock",
    am: "እቃው ወደ ክምችት ተመልሷል",
    om: "Meeshaan deebi'ee istookii keessa jira"
  },
  discount_started: {
    en: "Discount started",
    am: "ቅናሽ ተጀምሯል",
    om: "Hir'inni jalqabame"
  },

  // 🎫 Support Ticket
  ticket_created: {
    en: "Support ticket created",
    am: "የድጋፍ ትኬት ተፈጠረ",
    om: "Tikiitii deeggarsaa uumame"
  },
  ticket_resolved: {
    en: "Your support ticket was resolved",
    am: "የድጋፍ ጥያቄዎ ተፈታ",
    om: "Tikiitii deeggarsaa kee furuuf"
  },

  // 💬 Chat
  message: {
    en: "You have a new message",
    am: "አዲስ መልዕክት አለዎት",
    om: "Ergaa haaraa qabda"
  }
};

// 🌍 Helper to translate notification text
export const t = (key: string, lang: "en" | "am" | "om" = "en") => {
  return translations[key]?.[lang] || translations[key]?.en || key;
};
