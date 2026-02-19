const { checkCooldown } = require('../services/cooldownService');
const { handleError } = require('../utils/errorHandler');
const embed = require('../utils/embed');
const logger = require('../services/loggerService');

module.exports = {
  name: 'interactionCreate',
  once: false,

  /**
   * Handles all incoming interactions (slash commands).
   * @param {import('discord.js').Interaction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      await interaction.reply({
        embeds: [embed.error('Unknown Command', 'This command does not exist.')],
        ephemeral: true,
      });
      return;
    }

    const guildId = interaction.guildId || 'DM';
    const userId = interaction.user.id;

    /** Check cooldown */
    const { onCooldown, remaining } = checkCooldown(
      userId,
      interaction.commandName,
      guildId,
      command.cooldown
    );

    if (onCooldown) {
      await interaction.reply({
        embeds: [
          embed.warn(
            '⏳ Cooldown',
            `Please wait **${remaining}** second(s) before using \`/${interaction.commandName}\` again.`
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    try {
      await command.execute(interaction, client);
      logger.info(
        'Command',
        `${interaction.user.tag} used /${interaction.commandName} in ${guildId}`,
        client,
        guildId
      );
    } catch (err) {
      await handleError(interaction, err, `Command:${interaction.commandName}`);
    }
  },
};
