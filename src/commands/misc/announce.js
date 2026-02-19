const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Announce a message into a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((opt) => opt.setName('message').setDescription('The announcement message').setRequired(true))
    .addChannelOption((opt) => opt.setName('channel').setDescription('Channel to announce in (defaults to current)').addChannelTypes(ChannelType.GuildText)),
  cooldown: 10,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const message = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    await interaction.deferReply({ ephemeral: true });

    try {
      await channel.send({
        embeds: [
          embed.info('📢 Announcement', message)
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setFooter({ text: `Announced by ${interaction.user.tag}` }),
        ],
      });
      await interaction.editReply({ embeds: [embed.success('✅ Announced', `Announcement sent to ${channel}.`)] });
    } catch {
      await interaction.editReply({ embeds: [embed.error('Error', 'Failed to send announcement.')] });
    }
  },
};
