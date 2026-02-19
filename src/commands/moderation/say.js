const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Send a message as the bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((opt) => opt.setName('message').setDescription('The message to send').setRequired(true))
    .addChannelOption((opt) => opt.setName('channel').setDescription('Channel to send in (defaults to current)').addChannelTypes(ChannelType.GuildText)),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const message = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    await interaction.deferReply({ ephemeral: true });

    try {
      await channel.send({ content: message });
      await interaction.editReply({ embeds: [embed.success('✅ Message Sent', `Message sent to ${channel}.`)] });
    } catch {
      await interaction.editReply({ embeds: [embed.error('Error', 'Failed to send message to that channel.')] });
    }
  },
};
