export async function sendInvoice(chatId, serverUserId) {
  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendInvoice`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        title: process.env.PRODUCT_TITLE,
        description: process.env.PRODUCT_DESC,
        payload: `userId:${serverUserId}`,
        currency: "XTR",
        prices: [{ label: "Товар", amount: process.env.PRODUCT_PRICE }],
        start_parameter: "test",
        provider_token: "",
      }),
    }
  );

  const data = await response.json();
  console.log(data);
}
