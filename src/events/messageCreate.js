const Analytics = require('../models/Analytics');

module.exports = {
  name: 'messageCreate',
  once: false,

  /**
   * Track message count for analytics on every non-bot, non-command message in a guild.
   * @param {import('discord.js').Message} message
   * @param {import('discord.js').Client} client
   */
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.interaction) return;

    try {
      await Analytics.findOneAndUpdate(
        { discordId: message.author.id, guildId: message.guild.id },
        { $inc: { messageCount: 1 } },
        { upsert: true }
      );
    } catch {
      // Silently fail — analytics should never break the bot
    }
  },
};
