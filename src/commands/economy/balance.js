const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');
const economyService = require('../../services/economyService');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check someone\'s balance')
    .addUserOption((opt) => opt.setName('user').setDescription('User to check (defaults to you)')),
  cooldown: 3,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    const user = interaction.options.getUser('user') || interaction.user;
    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    const currency = guildConfig?.economy?.currencyName || 'coins';
    const startBal = guildConfig?.economy?.startingBalance || 0;

    const profile = await economyService.getProfile(user.id, interaction.guild.id, startBal);

    await interaction.reply({
      embeds: [
        embed.info(`💰 ${user.displayName}'s Balance`, '')
          .setDescription(null)
          .setThumbnail(user.displayAvatarURL())
          .addFields(
            { name: '👛 Wallet', value: `${profile.wallet.toLocaleString()} ${currency}`, inline: true },
            { name: '🏦 Bank', value: `${profile.bank.toLocaleString()} ${currency}`, inline: true },
            { name: '💎 Total', value: `${(profile.wallet + profile.bank).toLocaleString()} ${currency}`, inline: true }
          ),
      ],
    });
  },
};
