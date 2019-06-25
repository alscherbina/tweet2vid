const Telegraf = require('telegraf');
const videoService = require('../model/video.service');

const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const appDomain = process.env.APP_DOMAIN;

const bot = new Telegraf(telegramToken);
bot.telegram.setWebhook(`https://${appDomain}/${telegramToken}`);
bot.on('text', async ({ reply, message }) => {
  if (message.text) {
    try {
      const mediaInfo = await videoService.downloadMedia(message.text);
      const videoUrl = `https://${appDomain}/${mediaInfo.videoFileName}`;
      reply(videoUrl);
    } catch (err) {
      reply(`Sorry, I can't process your request`);
    }
  } else {
    reply('Sorry, I undestand tweets URLs only.');
  }
});

module.exports = bot.webhookCallback(`/${telegramToken}`);
