const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const ModLog = require('../../models/ModLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('modlogs')
    .setDescription('Show all the moderation actions taken against a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName('member').setDescription('The user to check').setRequired(true))
    .addIntegerOption((opt) => opt.setName('page').setDescription('Page number').setMinValue(1)),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const user = interaction.options.getUser('member');
    const page = interaction.options.getInteger('page') || 1;
    const perPage = 5;

    await interaction.deferReply();

    const total = await ModLog.countDocuments({ guildId: interaction.guild.id, targetId: user.id });
    const totalPages = Math.ceil(total / perPage) || 1;
    const logs = await ModLog.find({ guildId: interaction.guild.id, targetId: user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    if (!logs.length) {
      return interaction.editReply({ embeds: [embed.info('📋 Mod Logs', `No moderation logs found for ${user.tag}.`)] });
    }

    const lines = logs.map((log, i) => {
      const idx = (page - 1) * perPage + i + 1;
      const date = new Date(log.createdAt).toLocaleDateString();
      return `**${idx}.** \`${log.action.toUpperCase()}\` — ${log.reason}\n   By <@${log.moderatorId}> on ${date}${log.duration ? ` (${log.duration})` : ''}`;
    });

    await interaction.editReply({
      embeds: [
        embed.info(`📋 Mod Logs — ${user.tag}`, lines.join('\n\n'))
          .setFooter({ text: `Page ${page}/${totalPages} • Total: ${total} entries` }),
      ],
    });
  },
};
