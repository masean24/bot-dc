const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('activity-tracker')
    .setDescription('Activity tracker settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName('configure')
        .setDescription('Configure the activity tracker')
        .addBooleanOption((opt) => opt.setName('enabled').setDescription('Enable or disable tracking').setRequired(true))
        .addChannelOption((opt) => opt.setName('channel').setDescription('Channel for activity reports').addChannelTypes(ChannelType.GuildText))
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

    const enabled = interaction.options.getBoolean('enabled');
    const channel = interaction.options.getChannel('channel');

    guildConfig.activityTracker.enabled = enabled;
    if (channel) guildConfig.activityTracker.channelId = channel.id;
    await guildConfig.save();

    await interaction.editReply({
      embeds: [
        embed.success('✅ Activity Tracker Updated', '')
          .setDescription(null)
          .addFields(
            { name: 'Status', value: enabled ? '🟢 Enabled' : '🔴 Disabled', inline: true },
            { name: 'Channel', value: channel ? `${channel}` : 'Not set', inline: true }
          ),
      ],
    });
  },
};
