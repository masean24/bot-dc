const Analytics = require('../models/Analytics');
const CustomCommand = require('../models/CustomCommand');

const PREFIX = '!';

module.exports = {
  name: 'messageCreate',
  once: false,

  /**
   * Track message count for analytics and handle custom commands.
   * @param {import('discord.js').Message} message
   * @param {import('discord.js').Client} client
   */
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return;

    /** Handle custom commands with prefix */
    if (message.content.startsWith(PREFIX)) {
      const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
      const cmdName = args.shift()?.toLowerCase();

      if (cmdName) {
        try {
          const customCmd = await CustomCommand.findOne({ guildId: message.guild.id, name: cmdName });
          if (customCmd) {
            await message.channel.send(customCmd.response);
            return;
          }
        } catch {
          // Silently fail
        }
      }
    }

    /** Track analytics */
    if (!message.interaction) {
      try {
        await Analytics.findOneAndUpdate(
          { discordId: message.author.id, guildId: message.guild.id },
          { $inc: { messageCount: 1 } },
          { upsert: true }
        );
      } catch {
        // Silently fail — analytics should never break the bot
      }
    }
  },
};
