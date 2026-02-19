const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');
const nobloxService = require('../../services/nobloxService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('groupinfo')
    .setDescription('Get information about a group')
    .addStringOption((opt) => opt.setName('groupid').setDescription('Roblox group ID (defaults to configured group)')),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    await interaction.deferReply();

    let groupId = interaction.options.getString('groupid');
    if (!groupId) {
      const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
      groupId = guildConfig?.roblox?.groupId;
    }
    if (!groupId) {
      return interaction.editReply({ embeds: [embed.error('Error', 'No group ID provided and none configured for this server.')] });
    }

    try {
      const info = await nobloxService.getGroupInfo(Number(groupId));
      const infoEmbed = embed.roblox(`📋 ${info.name}`, info.description ? info.description.slice(0, 300) : 'No description.')
        .addFields(
          { name: 'Group ID', value: String(info.id), inline: true },
          { name: 'Owner', value: info.owner ? info.owner.username : 'N/A', inline: true },
          { name: 'Members', value: String(info.memberCount || 0), inline: true },
          { name: 'Shout', value: info.shout?.body || 'No shout', inline: false }
        );
      await interaction.editReply({ embeds: [infoEmbed] });
    } catch (err) {
      await interaction.editReply({ embeds: [embed.error('Error', `Could not fetch group info: ${err.message}`)] });
    }
  },
};
