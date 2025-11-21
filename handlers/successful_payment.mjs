import bot from "../bot.mjs";
import axios from "axios";

// Transaction ID: ${payment.telegram_payment_charge_id}.
// For a refund, use the command /refund ${payment.telegram_payment_charge_id}.

const message = (
  total_amount
) => `💰 Payment of ${total_amount} Telegram Stars was successful!

${process.env.SUCCESSFUL_PAYMENT_MESSAGE}
`;

const successful_payment = async (msg) => {
  const chatId = msg.chat.id;
  const payment = msg.successful_payment;

  bot.sendMessage(chatId, message(payment.total_amount));

  try {
    const response = await axios.post(process.env.SUCCESSFUL_PAYMENT_URL, {
      userId: chatId,
      orderId: payment.provider_payment_charge_id,
      amount: payment.total_amount,
      currency: payment.currency, // XTR
      invoice_payload: payment.invoice_payload,
    });
  } catch (error) {
    bot.sendMessage(
      chatId,
      "Error sending request to the server. Please contact support"
    );
    console.error("Request error:", error.message);
  }
};

export default successful_payment;
