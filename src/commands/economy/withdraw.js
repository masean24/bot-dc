const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');
const economyService = require('../../services/economyService');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Deposit money into your account')
    .addIntegerOption((opt) => opt.setName('amount').setDescription('Amount to withdraw').setRequired(true).setMinValue(1)),
  cooldown: 3,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    const amount = interaction.options.getInteger('amount');
    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    const currency = guildConfig?.economy?.currencyName || 'coins';

    const result = await economyService.withdraw(interaction.user.id, interaction.guild.id, amount);
    if (!result) {
      return interaction.reply({ embeds: [embed.error('Insufficient Funds', `You don't have **${amount}** ${currency} in your bank.`)], ephemeral: true });
    }

    await interaction.reply({
      embeds: [
        embed.success('💸 Withdrawal Successful', `Withdrew **${amount.toLocaleString()} ${currency}** from your bank.`)
          .addFields(
            { name: '👛 Wallet', value: `${result.wallet.toLocaleString()} ${currency}`, inline: true },
            { name: '🏦 Bank', value: `${result.bank.toLocaleString()} ${currency}`, inline: true }
          ),
      ],
    });
  },
};
