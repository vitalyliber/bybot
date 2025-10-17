import dotenv from "dotenv";
dotenv.config();

import TelegramBot from "node-telegram-bot-api";
import refund from "./handlers/refund.mjs";
import start from "./handlers/start.mjs";
import successful_payment from "./handlers/successful_payment.mjs";

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, { polling: true });

// Direct match: /\/start/
// String params: /\/start (.+)/
bot.onText(/\/start (.+)/, start);
bot.onText(/\/refund (.+)/, refund);

bot.on("pre_checkout_query", (preCheckoutQuery) => {
  bot.answerPreCheckoutQuery(preCheckoutQuery.id, true);
});

bot.on("successful_payment", successful_payment);

bot.on("polling_error", (error) => {
  console.error("Ошибка polling:", error);
});

console.log("Bot is running...");
