const Telegraf = require('telegraf');

const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const appDomain = process.env.APP_DOMAIN;

const bot = new Telegraf(telegramToken);
bot.telegram.setWebhook(`https://${appDomain}/${telegramToken}`);
bot.on('text', ({ replyWithHTML }) => replyWithHTML('<b>Test</b>'));

module.exports = bot.webhookCallback(`/${telegramToken}`);
