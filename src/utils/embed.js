const { EmbedBuilder } = require('discord.js');
const { Colors } = require('../config/constants');

/**
 * Create a success embed.
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @returns {EmbedBuilder}
 */
function success(title, description) {
  return new EmbedBuilder()
    .setColor(Colors.SUCCESS)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Create an error embed.
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @returns {EmbedBuilder}
 */
function error(title, description) {
  return new EmbedBuilder()
    .setColor(Colors.ERROR)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Create an info embed.
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @returns {EmbedBuilder}
 */
function info(title, description) {
  return new EmbedBuilder()
    .setColor(Colors.INFO)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Create a warning embed.
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @returns {EmbedBuilder}
 */
function warn(title, description) {
  return new EmbedBuilder()
    .setColor(Colors.WARN)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Create a Roblox-themed embed.
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @returns {EmbedBuilder}
 */
function roblox(title, description) {
  return new EmbedBuilder()
    .setColor(Colors.ROBLOX)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Create a game-themed embed.
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @returns {EmbedBuilder}
 */
function game(title, description) {
  return new EmbedBuilder()
    .setColor(Colors.GAME)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

module.exports = { success, error, info, warn, roblox, game };
