const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const economyService = require('../../services/economyService');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manage-cash')
    .setDescription('Manage cash for users')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add cash to someone in your server')
        .addUserOption((opt) => opt.setName('user').setDescription('The user').setRequired(true))
        .addIntegerOption((opt) => opt.setName('amount').setDescription('Amount to add').setRequired(true).setMinValue(1))
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove cash from someone in your server')
        .addUserOption((opt) => opt.setName('user').setDescription('The user').setRequired(true))
        .addIntegerOption((opt) => opt.setName('amount').setDescription('Amount to remove').setRequired(true).setMinValue(1))
    ),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    await interaction.deferReply();
    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    const currency = guildConfig?.economy?.currencyName || 'coins';

    if (sub === 'add') {
      const profile = await economyService.addToWallet(user.id, interaction.guild.id, amount, 'admin_add', `Added by ${interaction.user.tag}`);
      await interaction.editReply({
        embeds: [
          embed.success('✅ Cash Added', `Added **${amount.toLocaleString()} ${currency}** to ${user.tag}'s wallet.`)
            .addFields({ name: 'New Wallet', value: `${profile.wallet.toLocaleString()} ${currency}` }),
        ],
      });
    }

    if (sub === 'remove') {
      const profile = await economyService.removeFromWallet(user.id, interaction.guild.id, amount, 'admin_remove', `Removed by ${interaction.user.tag}`);
      if (!profile) {
        return interaction.editReply({ embeds: [embed.error('Error', `${user.tag} doesn't have enough in their wallet.`)] });
      }
      await interaction.editReply({
        embeds: [
          embed.success('✅ Cash Removed', `Removed **${amount.toLocaleString()} ${currency}** from ${user.tag}'s wallet.`)
            .addFields({ name: 'New Wallet', value: `${profile.wallet.toLocaleString()} ${currency}` }),
        ],
      });
    }
  },
};
