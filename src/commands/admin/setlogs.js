const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlogs')
    .setDescription('Configure logging channels')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName('moderation')
        .setDescription('Configure logs for moderation commands')
        .addChannelOption((opt) => opt.setName('channel').setDescription('Moderation log channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('dms')
        .setDescription('Configure logs for dms')
        .addChannelOption((opt) => opt.setName('channel').setDescription('DM log channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
    ),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    let guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildConfig) guildConfig = await Guild.create({ guildId: interaction.guild.id });

    const sub = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel('channel');

    if (sub === 'moderation') {
      guildConfig.moderation.logChannelId = channel.id;
      await guildConfig.save();
      return interaction.editReply({ embeds: [embed.success('✅ Moderation Logs Set', `Moderation logs will be sent to ${channel}.`)] });
    }

    if (sub === 'dms') {
      guildConfig.moderation.dmLogChannelId = channel.id;
      await guildConfig.save();
      return interaction.editReply({ embeds: [embed.success('✅ DM Logs Set', `DM logs will be sent to ${channel}.`)] });
    }
  },
};
