const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const User = require('../../models/User');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifyall')
    .setDescription('Mass verify people in your Discord server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  cooldown: 60,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'This command can only be used in a server.')], ephemeral: true });
    }

    await interaction.deferReply();

    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildConfig?.verification?.roleId) {
      return interaction.editReply({ embeds: [embed.error('Not Configured', 'No verification role is set. Use `/config verification role`.')] });
    }

    const verifiedUsers = await User.find({ guildId: interaction.guild.id, verified: true });
    if (!verifiedUsers.length) {
      return interaction.editReply({ embeds: [embed.info('No Verified Users', 'No verified users found in this server.')] });
    }

    let assigned = 0;
    let failed = 0;

    for (const userDoc of verifiedUsers) {
      try {
        const member = await interaction.guild.members.fetch(userDoc.discordId).catch(() => null);
        if (member && !member.roles.cache.has(guildConfig.verification.roleId)) {
          await member.roles.add(guildConfig.verification.roleId);
          assigned++;
        }
      } catch {
        failed++;
      }
    }

    await interaction.editReply({
      embeds: [
        embed.success('✅ Mass Verify Complete', '')
          .setDescription(null)
          .addFields(
            { name: 'Total Verified', value: String(verifiedUsers.length), inline: true },
            { name: 'Roles Assigned', value: String(assigned), inline: true },
            { name: 'Failed', value: String(failed), inline: true }
          ),
      ],
    });
  },
};
