import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

// Замените на ваш токен от @BotFather
const token = "8485116769:AAGXzACldkifCghcsh6YOFl1d5lJC96b258";
const bot = new TelegramBot(token, { polling: true });

// URL для запроса после оплаты (пример)
const SERVER_URL = "https://api.example.com/confirm-payment";

// Команда /start
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

// Обработка нажатия кнопки "Купить товар"
bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  if (callbackQuery.data === "buy") {
    async function sendTestInvoice() {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/test/sendInvoice`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            title: "Товар",
            description: "Описание вашего товара",
            payload: "item_001",
            currency: "XTR",
            prices: [{ label: "Товар", amount: 100 }],
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

// Обработка предпроверки платежа
bot.on("pre_checkout_query", (preCheckoutQuery) => {
  // Подтверждаем предпроверку платежа
  bot.answerPreCheckoutQuery(preCheckoutQuery.id, true);
});

// Обработка успешной оплаты
bot.on("successful_payment", async (msg) => {
  const chatId = msg.chat.id;
  const payment = msg.successful_payment;

  // Отправляем сообщение пользователю
  bot.sendMessage(
    chatId,
    `Оплата на сумму ${payment.total_amount} Telegram Stars прошла успешно!`
  );

  // Отправляем запрос на сервер
  try {
    const response = await axios.post(SERVER_URL, {
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

// Обработка ошибок
bot.on("polling_error", (error) => {
  console.error("Ошибка polling:", error);
});

console.log("Бот запущен...");
