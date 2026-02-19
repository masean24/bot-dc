const logger = require('../services/loggerService');

module.exports = {
  name: 'ready',
  once: true,

  /**
   * Fired when the client is ready.
   * @param {import('discord.js').Client} client
   */
  async execute(client) {
    logger.info('Ready', `Logged in as ${client.user.tag}`);
    logger.info('Ready', `Serving ${client.guilds.cache.size} guild(s)`);
  },
};
