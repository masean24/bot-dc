const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const ModLog = require('../../models/ModLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute someone in your Discord server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName('user').setDescription('The user to unmute').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for the unmute')),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({ embeds: [embed.error('Error', 'User not found in this server.')], ephemeral: true });
    }

    await interaction.deferReply();

    try {
      await member.timeout(null, reason);
    } catch {
      return interaction.editReply({ embeds: [embed.error('Error', 'Failed to unmute this user.')] });
    }

    await ModLog.create({
      guildId: interaction.guild.id,
      targetId: user.id,
      moderatorId: interaction.user.id,
      action: 'unmute',
      reason,
    });

    await interaction.editReply({
      embeds: [
        embed.success('🔊 User Unmuted', '')
          .setDescription(null)
          .addFields(
            { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
            { name: 'Moderator', value: interaction.user.tag, inline: true },
            { name: 'Reason', value: reason }
          ),
      ],
    });
  },
};
