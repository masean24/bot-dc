const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');
const embed = require('../../utils/embed');
const ModLog = require('../../models/ModLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute someone in your Discord server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName('user').setDescription('The user to mute').setRequired(true))
    .addStringOption((opt) => opt.setName('duration').setDescription('Duration (e.g. 10m, 1h, 1d)').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for the mute')),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const durationStr = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const duration = ms(durationStr);
    if (!duration || duration < 1000 || duration > 2419200000) {
      return interaction.reply({ embeds: [embed.error('Error', 'Invalid duration. Use formats like `10m`, `1h`, `1d`. Max: 28 days.')], ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({ embeds: [embed.error('Error', 'User not found in this server.')], ephemeral: true });
    }
    if (!member.moderatable) {
      return interaction.reply({ embeds: [embed.error('Error', 'I cannot mute this user.')], ephemeral: true });
    }

    await interaction.deferReply();

    try {
      await member.timeout(duration, reason);
    } catch {
      return interaction.editReply({ embeds: [embed.error('Error', 'Failed to mute this user.')] });
    }

    await ModLog.create({
      guildId: interaction.guild.id,
      targetId: user.id,
      moderatorId: interaction.user.id,
      action: 'mute',
      reason,
      duration: durationStr,
    });

    await interaction.editReply({
      embeds: [
        embed.success('🔇 User Muted', '')
          .setDescription(null)
          .addFields(
            { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
            { name: 'Duration', value: durationStr, inline: true },
            { name: 'Moderator', value: interaction.user.tag, inline: true },
            { name: 'Reason', value: reason }
          ),
      ],
    });
  },
};
