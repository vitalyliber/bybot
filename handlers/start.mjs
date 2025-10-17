import bot from "../bot.mjs";

import { sendInvoice } from "../api/sendInvoice.mjs";

const startMessage = (serverUserId) => `Hello 👋 

🙋🏼‍♀️ Support: ${process.env.SUPPORT_LINK}

Your Server Id: ${serverUserId}
`;

const start = (msg, match) => {
  const chatId = msg.chat.id;
  const serverUserId = match[1];

  bot.sendMessage(chatId, startMessage(serverUserId));
  sendInvoice(chatId, 1);
};

export default start;
