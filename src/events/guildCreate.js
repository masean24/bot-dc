const Guild = require('../models/Guild');
const logger = require('../services/loggerService');

module.exports = {
  name: 'guildCreate',
  once: false,

  /**
   * Fired when the bot joins a new guild. Auto-creates a Guild config document.
   * @param {import('discord.js').Guild} guild
   * @param {import('discord.js').Client} client
   */
  async execute(guild, client) {
    try {
      await Guild.findOneAndUpdate(
        { guildId: guild.id },
        { guildId: guild.id },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      logger.info('GuildCreate', `Joined guild: ${guild.name} (${guild.id})`, client, guild.id);
    } catch (err) {
      logger.error('GuildCreate', `Failed to init guild ${guild.id}: ${err.message}`);
    }
  },
};
