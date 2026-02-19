const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');
const nobloxService = require('../../services/nobloxService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('groupwallcleaner')
    .setDescription('Clean all the posts off of your group wall')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  cooldown: 30,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    await interaction.deferReply();

    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildConfig?.roblox?.cookie || !guildConfig?.roblox?.groupId) {
      return interaction.editReply({ embeds: [embed.error('Not Configured', 'Roblox cookie or group ID not set.')] });
    }

    const loggedIn = await nobloxService.ensureLoggedIn(guildConfig.roblox.cookie, interaction.guild.id);
    if (!loggedIn) {
      return interaction.editReply({ embeds: [embed.error('Auth Error', 'Failed to authenticate with Roblox.')] });
    }

    const groupId = Number(guildConfig.roblox.groupId);

    try {
      const posts = await nobloxService.getWallPosts(groupId, 'Desc', 100);
      const wallData = posts.data || posts;
      if (!wallData || !wallData.length) {
        return interaction.editReply({ embeds: [embed.info('🧹 Group Wall', 'The group wall is already clean.')] });
      }

      let deleted = 0;
      for (const post of wallData) {
        try {
          await nobloxService.deleteWallPost(groupId, post.id);
          deleted++;
        } catch {
          // Skip failed deletions
        }
      }

      await interaction.editReply({
        embeds: [embed.success('🧹 Group Wall Cleaned', `Deleted **${deleted}** post(s) from the group wall.`)],
      });
    } catch (err) {
      await interaction.editReply({ embeds: [embed.error('Error', err.message)] });
    }
  },
};
