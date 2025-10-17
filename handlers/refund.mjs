import bot from "../bot.mjs";

const token = process.env.TELEGRAM_TOKEN;

const refund = async (msg, match) => {
  const chatId = msg.chat.id;
  const telegramPaymentChargeId = match[1];

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/refundStarPayment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: chatId,
          telegram_payment_charge_id: telegramPaymentChargeId,
        }),
      }
    );

    const data = await response.json();

    if (data.ok) {
      bot.sendMessage(chatId, "Telegram Stars refund successfully completed!");
    } else {
      bot.sendMessage(
        chatId,
        `Refund error: ${data.description || "Unknown error"}`
      );
    }
  } catch (error) {
    bot.sendMessage(chatId, "Error while processing the refund.");
    console.error("Refund error:", error.message);
  }
};

export default refund;
