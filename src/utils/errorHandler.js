const embed = require('./embed');
const logger = require('../services/loggerService');

/**
 * Centralized error handler for interactions.
 * Logs the error and replies with a user-friendly embed.
 * Handles already-replied and deferred interactions gracefully.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction
 * @param {Error} error - The error object
 * @param {string} [context='Unknown'] - Context label for logging
 */
async function handleError(interaction, error, context = 'Unknown') {
  const guildId = interaction.guildId || 'DM';
  await logger.error(context, `${error.message}\n${error.stack}`, interaction.client, guildId);

  const errorEmbed = embed.error(
    '❌ Something went wrong',
    'An unexpected error occurred. Please try again later.'
  );

  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  } catch {
    // Interaction may have expired or be otherwise unreachable
  }
}

module.exports = { handleError };
