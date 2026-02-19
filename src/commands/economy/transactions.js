const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');
const economyService = require('../../services/economyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transactions')
    .setDescription('View someone\'s transactions')
    .addUserOption((opt) => opt.setName('user').setDescription('User to check (defaults to you)')),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    await interaction.deferReply();
    const user = interaction.options.getUser('user') || interaction.user;
    const txns = await economyService.getTransactions(user.id, interaction.guild.id, 10);

    if (!txns.length) {
      return interaction.editReply({ embeds: [embed.info('📒 Transactions', `No transactions found for ${user.tag}.`)] });
    }

    const lines = txns.map((t, i) => {
      const date = new Date(t.createdAt).toLocaleDateString();
      const sign = t.amount >= 0 ? '+' : '';
      return `**${i + 1}.** \`${t.type}\` ${sign}${t.amount.toLocaleString()} — ${t.description || 'N/A'} (${date})`;
    });

    await interaction.editReply({
      embeds: [embed.info(`📒 Transactions — ${user.displayName}`, lines.join('\n')).setFooter({ text: 'Last 10 transactions' })],
    });
  },
};
