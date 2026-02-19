const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');
const nobloxService = require('../../services/nobloxService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shout')
    .setDescription('New version of the shout command')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((opt) => opt.setName('message').setDescription('Shout message (leave empty to clear)')),
  cooldown: 10,

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

    const message = interaction.options.getString('message') || '';

    try {
      await nobloxService.postShout(Number(guildConfig.roblox.groupId), message);
      if (message) {
        await interaction.editReply({ embeds: [embed.success('📢 Shout Posted', `**Message:**\n${message}`)] });
      } else {
        await interaction.editReply({ embeds: [embed.success('📢 Shout Cleared', 'The group shout has been cleared.')] });
      }
    } catch (err) {
      await interaction.editReply({ embeds: [embed.error('Shout Failed', err.message)] });
    }
  },
};
