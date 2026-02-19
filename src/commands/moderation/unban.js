const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const ModLog = require('../../models/ModLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban someone from your Discord server')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((opt) => opt.setName('userid').setDescription('The user ID to unban').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for the unban')),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    await interaction.deferReply();

    try {
      await interaction.guild.members.unban(userId, reason);
    } catch {
      return interaction.editReply({ embeds: [embed.error('Error', 'Could not unban this user. Make sure the ID is correct and the user is banned.')] });
    }

    await ModLog.create({
      guildId: interaction.guild.id,
      targetId: userId,
      moderatorId: interaction.user.id,
      action: 'unban',
      reason,
    });

    await interaction.editReply({
      embeds: [
        embed.success('✅ User Unbanned', '')
          .setDescription(null)
          .addFields(
            { name: 'User ID', value: userId, inline: true },
            { name: 'Moderator', value: interaction.user.tag, inline: true },
            { name: 'Reason', value: reason }
          ),
      ],
    });
  },
};
