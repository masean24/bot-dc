const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');
const Analytics = require('../../models/Analytics');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('activity')
    .setDescription('Activity tracking')
    .addSubcommand((sub) =>
      sub
        .setName('fetch')
        .setDescription('Fetch someone or your own activity')
        .addUserOption((opt) => opt.setName('user').setDescription('User to check (defaults to you)'))
    )
    .addSubcommand((sub) =>
      sub
        .setName('leaderboard')
        .setDescription('View the leaderboard for this period')
    ),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    await interaction.deferReply();
    const sub = interaction.options.getSubcommand();

    if (sub === 'fetch') {
      const user = interaction.options.getUser('user') || interaction.user;
      const data = await Analytics.findOne({ discordId: user.id, guildId: interaction.guild.id });

      if (!data) {
        return interaction.editReply({ embeds: [embed.info('📊 Activity', `No activity data for ${user.tag}.`)] });
      }

      const allUsers = await Analytics.countDocuments({ guildId: interaction.guild.id });
      const rank = await Analytics.countDocuments({
        guildId: interaction.guild.id,
        messageCount: { $gt: data.messageCount },
      }) + 1;

      await interaction.editReply({
        embeds: [
          embed.info(`📊 Activity — ${user.displayName}`, '')
            .setDescription(null)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
              { name: '💬 Messages', value: data.messageCount.toLocaleString(), inline: true },
              { name: '🏆 Rank', value: `#${rank} / ${allUsers}`, inline: true }
            ),
        ],
      });
    }

    if (sub === 'leaderboard') {
      const topUsers = await Analytics.find({ guildId: interaction.guild.id })
        .sort({ messageCount: -1 })
        .limit(15)
        .lean();

      if (!topUsers.length) {
        return interaction.editReply({ embeds: [embed.info('📊 Activity Leaderboard', 'No activity data yet.')] });
      }

      const lines = [];
      for (let i = 0; i < topUsers.length; i++) {
        const entry = topUsers[i];
        let username = 'Unknown';
        try {
          const user = await client.users.fetch(entry.discordId);
          username = user.displayName || user.username;
        } catch { /* skip */ }

        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
        lines.push(`${medal} ${username} — **${entry.messageCount.toLocaleString()}** messages`);
      }

      await interaction.editReply({
        embeds: [
          embed.info('📊 Activity Leaderboard', lines.join('\n'))
            .setFooter({ text: `Top ${topUsers.length} in ${interaction.guild.name}` }),
        ],
      });
    }
  },
};
