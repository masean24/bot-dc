const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const Session = require('../../models/Session');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('startsession')
    .setDescription('Start a new session')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((opt) => opt.setName('name').setDescription('Session name to start').setRequired(true)),
  cooldown: 10,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    await interaction.deferReply();

    const name = interaction.options.getString('name');
    const session = await Session.findOne({ guildId: interaction.guild.id, name, status: 'scheduled' });
    if (!session) {
      return interaction.editReply({ embeds: [embed.error('Not Found', `No scheduled session named **${name}** found.`)] });
    }

    session.status = 'active';
    session.startedAt = new Date();
    session.channelId = interaction.channel.id;

    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    const announceChannelId = guildConfig?.sessions?.channelId;

    const sessionEmbed = embed.success('🟢 Session Started!', '')
      .setDescription(null)
      .addFields(
        { name: 'Session', value: session.name, inline: true },
        { name: 'Type', value: session.type, inline: true },
        { name: 'Host', value: `<@${session.hostId}>`, inline: true },
        { name: 'Notes', value: session.notes || 'None' }
      )
      .setFooter({ text: `Started at ${new Date().toLocaleTimeString()}` });

    if (announceChannelId) {
      try {
        const channel = await interaction.guild.channels.fetch(announceChannelId);
        const msg = await channel.send({ embeds: [sessionEmbed] });
        session.messageId = msg.id;
      } catch {
        // Channel may not exist
      }
    }

    await session.save();

    await interaction.editReply({ embeds: [sessionEmbed] });
  },
};
