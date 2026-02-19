const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');
const Suggestion = require('../../models/Suggestion');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Suggest something in the server')
    .addStringOption((opt) => opt.setName('suggestion').setDescription('Your suggestion').setRequired(true)),
  cooldown: 30,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    const channelId = guildConfig?.suggestions?.channelId;

    if (!channelId) {
      return interaction.editReply({ embeds: [embed.error('Not Configured', 'Suggestions channel not set. Ask an admin to configure it.')] });
    }

    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
    if (!channel) {
      return interaction.editReply({ embeds: [embed.error('Error', 'Suggestions channel not found.')] });
    }

    const content = interaction.options.getString('suggestion');

    const suggestionEmbed = embed.info('💡 New Suggestion', content)
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .addFields(
        { name: '👍 Upvotes', value: '0', inline: true },
        { name: '👎 Downvotes', value: '0', inline: true },
        { name: 'Status', value: '⏳ Pending', inline: true }
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('suggest_up').setEmoji('👍').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('suggest_down').setEmoji('👎').setStyle(ButtonStyle.Danger)
    );

    const msg = await channel.send({ embeds: [suggestionEmbed], components: [row] });

    await Suggestion.create({
      guildId: interaction.guild.id,
      messageId: msg.id,
      channelId: channel.id,
      authorId: interaction.user.id,
      content,
    });

    await interaction.editReply({ embeds: [embed.success('✅ Suggestion Submitted', `Your suggestion has been posted in ${channel}.`)] });
  },
};
