const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const ModLog = require('../../models/ModLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick someone from your Discord server')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((opt) => opt.setName('user').setDescription('The user to kick').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for the kick')),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (user.id === interaction.user.id) {
      return interaction.reply({ embeds: [embed.error('Error', 'You cannot kick yourself.')], ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({ embeds: [embed.error('Error', 'User not found in this server.')], ephemeral: true });
    }
    if (!member.kickable) {
      return interaction.reply({ embeds: [embed.error('Error', 'I cannot kick this user. They may have a higher role than me.')], ephemeral: true });
    }

    await interaction.deferReply();

    try {
      await member.kick(reason);
    } catch {
      return interaction.editReply({ embeds: [embed.error('Error', 'Failed to kick this user.')] });
    }

    await ModLog.create({
      guildId: interaction.guild.id,
      targetId: user.id,
      moderatorId: interaction.user.id,
      action: 'kick',
      reason,
    });

    await interaction.editReply({
      embeds: [
        embed.success('👢 User Kicked', '')
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
