const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const User = require('../../models/User');
const Guild = require('../../models/Guild');
const RankBinding = require('../../models/RankBinding');
const robloxService = require('../../services/robloxService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('updateroles')
    .setDescription('Update a member\'s Discord roles based on rank bindings')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption((opt) => opt.setName('user').setDescription('The user to update').setRequired(true)),
  cooldown: 10,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user');
    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildConfig?.roblox?.groupId) {
      return interaction.editReply({ embeds: [embed.error('Not Configured', 'No Roblox group configured.')] });
    }

    const userDoc = await User.findOne({ discordId: targetUser.id, guildId: interaction.guild.id, verified: true });
    if (!userDoc) {
      return interaction.editReply({ embeds: [embed.error('Not Verified', `${targetUser.tag} is not verified.`)] });
    }

    const bindings = await RankBinding.find({ guildId: interaction.guild.id, groupId: guildConfig.roblox.groupId });
    if (!bindings.length) {
      return interaction.editReply({ embeds: [embed.warn('No Bindings', 'No rank bindings configured. Use `/bind role` to create some.')] });
    }

    const groupRoles = await robloxService.getUserGroupRoles(userDoc.robloxUserId);
    const groupEntry = groupRoles.find((r) => String(r.group.id) === guildConfig.roblox.groupId);
    const userRank = groupEntry ? groupEntry.role.rank : 0;

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      return interaction.editReply({ embeds: [embed.error('Error', 'User not found in server.')] });
    }

    let added = 0;
    let removed = 0;

    for (const binding of bindings) {
      try {
        if (userRank >= binding.robloxRankId) {
          if (!member.roles.cache.has(binding.discordRoleId)) {
            await member.roles.add(binding.discordRoleId);
            added++;
          }
        } else {
          if (member.roles.cache.has(binding.discordRoleId)) {
            await member.roles.remove(binding.discordRoleId);
            removed++;
          }
        }
      } catch {
        // Skip roles we can't manage
      }
    }

    await interaction.editReply({
      embeds: [
        embed.success('🔄 Roles Updated', '')
          .setDescription(null)
          .addFields(
            { name: 'User', value: `${targetUser.tag} (${userDoc.robloxUsername})`, inline: true },
            { name: 'Rank', value: String(userRank), inline: true },
            { name: 'Changes', value: `+${added} added, -${removed} removed`, inline: true }
          ),
      ],
    });
  },
};
