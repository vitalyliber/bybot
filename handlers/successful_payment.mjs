import bot from "../bot.mjs";
import axios from "axios";

const successful_payment = async (msg) => {
  const chatId = msg.chat.id;
  const payment = msg.successful_payment;

  bot.sendMessage(
    chatId,
    `Payment of ${payment.total_amount} Telegram Stars was successful! ` +
      `Transaction ID: ${payment.telegram_payment_charge_id}. ` +
      `For a refund, use the command /refund ${payment.telegram_payment_charge_id}`
  );

  try {
    const response = await axios.post(process.env.SERVER_URL, {
      userId: chatId,
      orderId: payment.provider_payment_charge_id,
      amount: payment.total_amount,
      currency: payment.currency, // XTR
      item: payment.invoice_payload,
    });
    bot.sendMessage(
      chatId,
      `Request sent to the server. Response: ${
        response.data.message || "Success"
      }`
    );
  } catch (error) {
    bot.sendMessage(chatId, "Error sending request to the server.");
    console.error("Request error:", error.message);
  }
};

export default successful_payment;
