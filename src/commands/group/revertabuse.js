const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');
const nobloxService = require('../../services/nobloxService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('revertabuse')
    .setDescription('Revert ranking abuse done in a group')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((opt) => opt.setName('username').setDescription('Roblox username of the abuser').setRequired(true)),
  cooldown: 15,

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

    const username = interaction.options.getString('username');
    const robloxService = require('../../services/robloxService');
    const robloxUser = await robloxService.getUserIdFromUsername(username);
    if (!robloxUser) {
      return interaction.editReply({ embeds: [embed.error('Not Found', `Roblox user "${username}" not found.`)] });
    }

    const groupId = Number(guildConfig.roblox.groupId);
    const abuserId = Number(robloxUser.id);

    try {
      const auditLog = await nobloxService.getAuditLog(groupId, 'ChangeRank', 50);
      const logs = auditLog.data || auditLog;
      const abuseLogs = logs.filter((l) => l.actor && l.actor.user && l.actor.user.userId === abuserId);

      if (!abuseLogs.length) {
        return interaction.editReply({ embeds: [embed.info('No Abuse Found', `No rank changes by **${robloxUser.name}** found in recent audit log.`)] });
      }

      let reverted = 0;
      for (const log of abuseLogs) {
        try {
          if (log.description && log.description.TargetId && log.description.OldRoleSetId) {
            await nobloxService.setRank(groupId, log.description.TargetId, log.description.OldRoleSetId);
            reverted++;
          }
        } catch {
          // Skip failed reverts
        }
      }

      await interaction.editReply({
        embeds: [embed.success('🔄 Abuse Reverted', `Reverted **${reverted}** rank change(s) made by **${robloxUser.name}**.`)],
      });
    } catch (err) {
      await interaction.editReply({ embeds: [embed.error('Error', err.message)] });
    }
  },
};
