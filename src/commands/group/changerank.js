const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');
const User = require('../../models/User');
const nobloxService = require('../../services/nobloxService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('changerank')
    .setDescription('Change someone\'s rank in your group')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption((opt) => opt.setName('user').setDescription('The Discord user').setRequired(true))
    .addIntegerOption((opt) => opt.setName('rank').setDescription('The rank number (0-255)').setRequired(true).setMinValue(0).setMaxValue(255)),
  cooldown: 5,

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

    const targetUser = interaction.options.getUser('user');
    const rank = interaction.options.getInteger('rank');
    const userDoc = await User.findOne({ discordId: targetUser.id, guildId: interaction.guild.id, verified: true });
    if (!userDoc) {
      return interaction.editReply({ embeds: [embed.error('Not Verified', `${targetUser.tag} is not verified.`)] });
    }

    try {
      const result = await nobloxService.setRank(Number(guildConfig.roblox.groupId), Number(userDoc.robloxUserId), rank);
      await interaction.editReply({
        embeds: [
          embed.success('🔄 Rank Changed', '')
            .setDescription(null)
            .addFields(
              { name: 'Roblox User', value: userDoc.robloxUsername, inline: true },
              { name: 'Old Rank', value: `${result.oldRole.name} (${result.oldRole.rank})`, inline: true },
              { name: 'New Rank', value: `${result.newRole.name} (${result.newRole.rank})`, inline: true }
            ),
        ],
      });
    } catch (err) {
      await interaction.editReply({ embeds: [embed.error('Rank Change Failed', err.message)] });
    }
  },
};
