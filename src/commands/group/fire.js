const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');
const User = require('../../models/User');
const nobloxService = require('../../services/nobloxService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fire')
    .setDescription('Fire a member in your group')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption((opt) => opt.setName('user').setDescription('The Discord user to fire').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for firing')),
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
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const userDoc = await User.findOne({ discordId: targetUser.id, guildId: interaction.guild.id, verified: true });
    if (!userDoc) {
      return interaction.editReply({ embeds: [embed.error('Not Verified', `${targetUser.tag} is not verified.`)] });
    }

    try {
      await nobloxService.exileUser(Number(guildConfig.roblox.groupId), Number(userDoc.robloxUserId));
      await interaction.editReply({
        embeds: [
          embed.success('🔥 User Fired', '')
            .setDescription(null)
            .addFields(
              { name: 'Roblox User', value: userDoc.robloxUsername, inline: true },
              { name: 'Fired By', value: interaction.user.tag, inline: true },
              { name: 'Reason', value: reason }
            ),
        ],
      });
    } catch (err) {
      await interaction.editReply({ embeds: [embed.error('Fire Failed', err.message)] });
    }
  },
};
