const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');
const User = require('../../models/User');
const nobloxService = require('../../services/nobloxService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('promote')
    .setDescription('Promote a member in your group')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption((opt) => opt.setName('user').setDescription('The Discord user to promote').setRequired(true)),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    await interaction.deferReply();

    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildConfig?.roblox?.cookie || !guildConfig?.roblox?.groupId) {
      return interaction.editReply({ embeds: [embed.error('Not Configured', 'Roblox cookie or group ID not set. Use `/setup cookie` and `/config roblox group`.')] });
    }

    const loggedIn = await nobloxService.ensureLoggedIn(guildConfig.roblox.cookie, interaction.guild.id);
    if (!loggedIn) {
      return interaction.editReply({ embeds: [embed.error('Auth Error', 'Failed to authenticate with Roblox. The cookie may be expired.')] });
    }

    const targetUser = interaction.options.getUser('user');
    const userDoc = await User.findOne({ discordId: targetUser.id, guildId: interaction.guild.id, verified: true });
    if (!userDoc) {
      return interaction.editReply({ embeds: [embed.error('Not Verified', `${targetUser.tag} is not verified.`)] });
    }

    try {
      const result = await nobloxService.promoteUser(Number(guildConfig.roblox.groupId), Number(userDoc.robloxUserId));
      await interaction.editReply({
        embeds: [
          embed.success('⬆️ User Promoted', '')
            .setDescription(null)
            .addFields(
              { name: 'Roblox User', value: userDoc.robloxUsername, inline: true },
              { name: 'Old Rank', value: `${result.oldRole.name} (${result.oldRole.rank})`, inline: true },
              { name: 'New Rank', value: `${result.newRole.name} (${result.newRole.rank})`, inline: true }
            ),
        ],
      });
    } catch (err) {
      await interaction.editReply({ embeds: [embed.error('Promote Failed', err.message)] });
    }
  },
};
