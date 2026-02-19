const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');
const robloxService = require('../../services/robloxService');
const User = require('../../models/User');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sync-roblox')
    .setDescription('Sync your Roblox group rank with this server'),
  cooldown: 15,

  /**
   * Execute the sync-roblox command.
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({
        embeds: [embed.error('Error', 'This command can only be used in a server.')],
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const user = await User.findOne({
      discordId: interaction.user.id,
      guildId: interaction.guild.id,
      verified: true,
    });

    if (!user) {
      return interaction.editReply({
        embeds: [
          embed.error(
            'Not Verified',
            'You must verify your Roblox account first with `/verify`.'
          ),
        ],
      });
    }

    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildConfig?.roblox?.groupId) {
      return interaction.editReply({
        embeds: [
          embed.error(
            'Not Configured',
            'No Roblox group has been configured for this server. Ask an admin to use `/config roblox group`.'
          ),
        ],
      });
    }

    if (!guildConfig.roblox.verifiedRoleId) {
      return interaction.editReply({
        embeds: [
          embed.error(
            'Not Configured',
            'No Roblox verified role has been set. Ask an admin to use `/config roblox role`.'
          ),
        ],
      });
    }

    const rankInfo = await robloxService.getUserGroupRank(
      user.robloxUserId,
      guildConfig.roblox.groupId
    );

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const minimumRank = guildConfig.roblox.minimumRank || 0;
    const roleId = guildConfig.roblox.verifiedRoleId;

    if (!rankInfo) {
      try {
        await member.roles.remove(roleId);
      } catch {
        // Bot may lack permissions
      }
      return interaction.editReply({
        embeds: [
          embed.warn(
            '⚠️ Not In Group',
            `You are not a member of the configured Roblox group (ID: ${guildConfig.roblox.groupId}).`
          ),
        ],
      });
    }

    if (rankInfo.rank >= minimumRank) {
      try {
        await member.roles.add(roleId);
      } catch {
        return interaction.editReply({
          embeds: [embed.error('Permission Error', 'I could not assign the role. Check my permissions.')],
        });
      }

      return interaction.editReply({
        embeds: [
          embed.success('✅ Rank Synced', '')
            .setDescription(null)
            .addFields(
              { name: 'Roblox User', value: user.robloxUsername, inline: true },
              { name: 'Group Rank', value: `${rankInfo.roleName} (${rankInfo.rank})`, inline: true },
              { name: 'Result', value: '🟢 Role assigned — you meet the minimum rank requirement.' }
            ),
        ],
      });
    }

    try {
      await member.roles.remove(roleId);
    } catch {
      // Bot may lack permissions
    }

    return interaction.editReply({
      embeds: [
        embed.warn('⚠️ Rank Too Low', '')
          .setDescription(null)
          .addFields(
            { name: 'Roblox User', value: user.robloxUsername, inline: true },
            { name: 'Your Rank', value: `${rankInfo.roleName} (${rankInfo.rank})`, inline: true },
            { name: 'Minimum Required', value: String(minimumRank), inline: true },
            { name: 'Result', value: '🔴 Role removed — your rank is below the minimum requirement.' }
          ),
      ],
    });
  },
};
