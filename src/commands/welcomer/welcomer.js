const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcomer')
    .setDescription('Configure welcomer messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName('join')
        .setDescription('Configure welcomer for joins')
        .addChannelOption((opt) => opt.setName('channel').setDescription('Welcome channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addStringOption((opt) => opt.setName('message').setDescription('Welcome message ({user} = mention, {server} = server name)'))
    )
    .addSubcommand((sub) =>
      sub
        .setName('leave')
        .setDescription('Configure welcomer for leaves')
        .addChannelOption((opt) => opt.setName('channel').setDescription('Leave channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addStringOption((opt) => opt.setName('message').setDescription('Leave message ({user} = username, {server} = server name)'))
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

    if (sub === 'join') {
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message') || 'Welcome to the server, {user}!';

      guildConfig.welcome.enabled = true;
      guildConfig.welcome.channelId = channel.id;
      guildConfig.welcome.message = message;
      await guildConfig.save();

      return interaction.editReply({
        embeds: [
          embed.success('✅ Join Welcomer Set', '')
            .setDescription(null)
            .addFields(
              { name: 'Channel', value: `${channel}`, inline: true },
              { name: 'Message', value: message }
            ),
        ],
      });
    }

    if (sub === 'leave') {
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message') || '{user} has left the server.';

      guildConfig.leave.enabled = true;
      guildConfig.leave.channelId = channel.id;
      guildConfig.leave.message = message;
      await guildConfig.save();

      return interaction.editReply({
        embeds: [
          embed.success('✅ Leave Welcomer Set', '')
            .setDescription(null)
            .addFields(
              { name: 'Channel', value: `${channel}`, inline: true },
              { name: 'Message', value: message }
            ),
        ],
      });
    }
  },
};
