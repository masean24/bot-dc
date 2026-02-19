const { checkCooldown } = require('../services/cooldownService');
const { handleError } = require('../utils/errorHandler');
const embed = require('../utils/embed');
const logger = require('../services/loggerService');
const Ticket = require('../models/Ticket');
const Suggestion = require('../models/Suggestion');

module.exports = {
  name: 'interactionCreate',
  once: false,

  /**
   * Handles all incoming interactions (slash commands, buttons).
   * @param {import('discord.js').Interaction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    /** Handle button interactions */
    if (interaction.isButton()) {
      try {
        if (interaction.customId === 'ticket_close') {
          const ticket = await Ticket.findOne({ guildId: interaction.guild.id, channelId: interaction.channel.id, status: 'open' });
          if (!ticket) {
            return interaction.reply({ embeds: [embed.error('Error', 'This ticket is already closed or invalid.')], ephemeral: true });
          }

          await interaction.reply({ embeds: [embed.warn('🔒 Closing Ticket', 'This ticket will be deleted in 5 seconds...')] });
          ticket.status = 'closed';
          await ticket.save();

          setTimeout(async () => {
            try {
              await interaction.channel.delete();
            } catch { /* Channel may already be deleted */ }
          }, 5000);
          return;
        }

        if (interaction.customId === 'suggest_up' || interaction.customId === 'suggest_down') {
          const suggestion = await Suggestion.findOne({ guildId: interaction.guild.id, messageId: interaction.message.id });
          if (!suggestion) {
            return interaction.reply({ embeds: [embed.error('Error', 'Suggestion not found.')], ephemeral: true });
          }

          if (interaction.customId === 'suggest_up') {
            suggestion.upvotes += 1;
          } else {
            suggestion.downvotes += 1;
          }
          await suggestion.save();

          const updatedEmbed = interaction.message.embeds[0];
          if (updatedEmbed) {
            const newEmbed = embed.info(updatedEmbed.title || '💡 Suggestion', updatedEmbed.description || suggestion.content)
              .setAuthor(updatedEmbed.author)
              .setFields(
                { name: '👍 Upvotes', value: String(suggestion.upvotes), inline: true },
                { name: '👎 Downvotes', value: String(suggestion.downvotes), inline: true },
                { name: 'Status', value: '⏳ Pending', inline: true }
              );
            await interaction.update({ embeds: [newEmbed] });
          } else {
            await interaction.reply({ content: 'Vote recorded!', ephemeral: true });
          }
          return;
        }
      } catch (err) {
        logger.error('Button', `Button interaction error: ${err.message}`);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ embeds: [embed.error('Error', 'Something went wrong.')], ephemeral: true }).catch(() => {});
        }
      }
      return;
    }

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
