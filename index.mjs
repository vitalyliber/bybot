import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Добро пожаловать! Нажмите "Купить товар" для покупки за Telegram Stars.',
    {
      reply_markup: {
        inline_keyboard: [[{ text: "Купить товар", callback_data: "buy" }]],
      },
    }
  );
});

bot.onText(/\/refund (.+)/, async (msg, match) => {
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
      bot.sendMessage(chatId, "Возврат Telegram Stars успешно выполнен!");
    } else {
      bot.sendMessage(
        chatId,
        `Ошибка при возврате: ${data.description || "Неизвестная ошибка"}`
      );
    }
  } catch (error) {
    bot.sendMessage(chatId, "Ошибка при выполнении возврата.");
    console.error("Ошибка возврата:", error.message);
  }
});

bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  if (callbackQuery.data === "buy") {
    async function sendTestInvoice() {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendInvoice`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            title: "Товар",
            description: "Описание вашего товара",
            payload: "item_001",
            currency: "XTR",
            prices: [{ label: "Товар", amount: 1 }],
            start_parameter: "test",
            provider_token: "",
          }),
        }
      );

      const data = await response.json();
      console.log(data); // Здесь увидишь точный ответ от Telegram
    }
    sendTestInvoice();
  }
});

bot.on("pre_checkout_query", (preCheckoutQuery) => {
  bot.answerPreCheckoutQuery(preCheckoutQuery.id, true);
});

bot.on("successful_payment", async (msg) => {
  const chatId = msg.chat.id;
  const payment = msg.successful_payment;

  bot.sendMessage(
    chatId,
    `Оплата на сумму ${payment.total_amount} Telegram Stars прошла успешно! ` +
      `ID транзакции: ${payment.telegram_payment_charge_id}. ` +
      `Для возврата используйте команду /refund ${payment.telegram_payment_charge_id}`
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
      `Запрос на сервер отправлен. Ответ: ${response.data.message || "Успех"}`
    );
  } catch (error) {
    bot.sendMessage(chatId, "Ошибка при отправке запроса на сервер.");
    console.error("Ошибка запроса:", error.message);
  }
});

bot.on("polling_error", (error) => {
  console.error("Ошибка polling:", error);
});

console.log("Bot is running...");
