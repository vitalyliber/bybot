import TelegramBot from "node-telegram-bot-api";
import refund from "./handlers/refund.mjs";
import start from "./handlers/start.mjs";
import successful_payment from "./handlers/successful_payment.mjs";

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// Direct match: /\/start/
// String params: /\/start (.+)/
bot.onText(/\/start (.+)/, start);
bot.onText(/\/secret_refund (.+)/, refund);

bot.on("pre_checkout_query", (preCheckoutQuery) => {
  console.log("pre_checkout_query", preCheckoutQuery);
  if (preCheckoutQuery.invoice_payload) {
    bot.answerPreCheckoutQuery(preCheckoutQuery.id, true);
  } else {
    bot.sendMessage(
      chatId,
      "Something went wrong (server user ID is not provided). Please contact support."
    );
  }
});

bot.on("successful_payment", successful_payment);

bot.on("polling_error", (error) => {
  console.error("Ошибка polling:", error);
});

console.log("Bot is running...");
