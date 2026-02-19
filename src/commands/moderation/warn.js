const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const ModLog = require('../../models/ModLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn someone in your Discord server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName('user').setDescription('The user to warn').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for the warning').setRequired(true)),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    await interaction.deferReply();

    await ModLog.create({
      guildId: interaction.guild.id,
      targetId: user.id,
      moderatorId: interaction.user.id,
      action: 'warn',
      reason,
    });

    const totalWarns = await ModLog.countDocuments({
      guildId: interaction.guild.id,
      targetId: user.id,
      action: 'warn',
    });

    try {
      await user.send({
        embeds: [
          embed.warn('⚠️ You have been warned', `**Server:** ${interaction.guild.name}\n**Reason:** ${reason}\n**Total Warnings:** ${totalWarns}`),
        ],
      });
    } catch {
      // DMs may be closed
    }

    await interaction.editReply({
      embeds: [
        embed.success('⚠️ User Warned', '')
          .setDescription(null)
          .addFields(
            { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
            { name: 'Moderator', value: interaction.user.tag, inline: true },
            { name: 'Total Warnings', value: String(totalWarns), inline: true },
            { name: 'Reason', value: reason }
          ),
      ],
    });
  },
};
