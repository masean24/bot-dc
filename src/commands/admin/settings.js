const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('View or change your group\'s settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const g = await Guild.findOne({ guildId: interaction.guild.id });
    if (!g) {
      return interaction.editReply({ embeds: [embed.warn('Not Setup', 'Run `/setup` first.')] });
    }

    const yn = (v) => (v ? '🟢 Enabled' : '🔴 Disabled');
    const ch = (id) => (id ? `<#${id}>` : 'Not set');
    const rl = (id) => (id ? `<@&${id}>` : 'Not set');

    await interaction.editReply({
      embeds: [
        embed.info(`⚙️ Settings — ${interaction.guild.name}`, '')
          .setDescription(null)
          .addFields(
            { name: '👋 Welcome', value: `${yn(g.welcome?.enabled)}\nChannel: ${ch(g.welcome?.channelId)}`, inline: true },
            { name: '👋 Leave', value: `${yn(g.leave?.enabled)}\nChannel: ${ch(g.leave?.channelId)}`, inline: true },
            { name: '✅ Verification', value: `${yn(g.verification?.enabled)}\nRole: ${rl(g.verification?.roleId)}`, inline: true },
            { name: '🎮 Roblox', value: `Group: \`${g.roblox?.groupId || 'Not set'}\`\nMin Rank: \`${g.roblox?.minimumRank || 0}\`\nRole: ${rl(g.roblox?.verifiedRoleId)}\nCookie: ${g.roblox?.cookie ? '🔑 Set' : '❌ Not set'}`, inline: true },
            { name: '📝 Logging', value: `${yn(g.logging?.enabled)}\nChannel: ${ch(g.logging?.channelId)}`, inline: true },
            { name: '🔨 Moderation', value: `Mod Log: ${ch(g.moderation?.logChannelId)}\nDM Log: ${ch(g.moderation?.dmLogChannelId)}`, inline: true },
            { name: '💰 Economy', value: `${yn(g.economy?.enabled)}\nCurrency: \`${g.economy?.currencyName || 'coins'}\`\nWork CD: \`${g.economy?.workCooldown || 60}s\``, inline: true },
            { name: '🎫 Tickets', value: `${yn(g.tickets?.enabled)}\nCategory: ${g.tickets?.categoryId ? `\`${g.tickets.categoryId}\`` : 'Not set'}`, inline: true },
            { name: '💡 Suggestions', value: `${yn(g.suggestions?.enabled)}\nChannel: ${ch(g.suggestions?.channelId)}`, inline: true }
          ),
      ],
    });
  },
};
