const Guild = require('../models/Guild');
const { Colors } = require('../config/constants');
const { EmbedBuilder } = require('discord.js');

/**
 * Format a timestamp string for log output.
 * @returns {string} ISO timestamp
 */
function timestamp() {
  return new Date().toISOString();
}

/**
 * Log an info-level message.
 * @param {string} context - Context label (e.g. command name)
 * @param {string} message - Log message
 * @param {import('discord.js').Client} [client] - Discord client for guild logging
 * @param {string} [guildId] - Guild ID for guild channel logging
 */
async function info(context, message, client, guildId) {
  console.log(`[${timestamp()}] [INFO] [${context}] ${message}`);
  await sendToGuildLog(client, guildId, 'INFO', context, message, Colors.INFO);
}

/**
 * Log a warn-level message.
 * @param {string} context - Context label
 * @param {string} message - Log message
 * @param {import('discord.js').Client} [client] - Discord client
 * @param {string} [guildId] - Guild ID
 */
async function warn(context, message, client, guildId) {
  console.warn(`[${timestamp()}] [WARN] [${context}] ${message}`);
  await sendToGuildLog(client, guildId, 'WARN', context, message, Colors.WARN);
}

/**
 * Log an error-level message.
 * @param {string} context - Context label
 * @param {string} message - Log message
 * @param {import('discord.js').Client} [client] - Discord client
 * @param {string} [guildId] - Guild ID
 */
async function error(context, message, client, guildId) {
  console.error(`[${timestamp()}] [ERROR] [${context}] ${message}`);
  await sendToGuildLog(client, guildId, 'ERROR', context, message, Colors.ERROR);
}

/**
 * Optionally send a log embed to the guild's configured logging channel.
 * @param {import('discord.js').Client|undefined} client
 * @param {string|undefined} guildId
 * @param {string} level
 * @param {string} context
 * @param {string} message
 * @param {number} color
 */
async function sendToGuildLog(client, guildId, level, context, message, color) {
  if (!client || !guildId) return;

  try {
    const guildConfig = await Guild.findOne({ guildId });
    if (!guildConfig?.logging?.enabled || !guildConfig.logging.channelId) return;

    const channel = await client.channels.fetch(guildConfig.logging.channelId).catch(() => null);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle(`[${level}] ${context}`)
      .setDescription(message.slice(0, 4000))
      .setColor(color)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch {
    // Silently fail to prevent recursive errors
  }
}

module.exports = { info, warn, error };
