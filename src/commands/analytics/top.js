const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');
const Analytics = require('../../models/Analytics');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('View the top 10 most active users in this server'),
  cooldown: 10,

  /**
   * Execute the top command.
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

    await interaction.deferReply();

    const topUsers = await Analytics.find({ guildId: interaction.guild.id })
      .sort({ messageCount: -1 })
      .limit(10)
      .lean();

    if (!topUsers.length) {
      return interaction.editReply({
        embeds: [embed.info('📊 Leaderboard', 'No message data yet. Start chatting!')],
      });
    }

    const lines = [];
    for (let i = 0; i < topUsers.length; i++) {
      const entry = topUsers[i];
      let username = 'Unknown User';
      try {
        const user = await client.users.fetch(entry.discordId);
        username = user.displayName || user.username;
      } catch {
        // User may have left
      }

      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
      lines.push(`${medal} ${username} — **${entry.messageCount.toLocaleString()}** messages`);
    }

    const leaderboardEmbed = embed
      .info('📊 Message Leaderboard', lines.join('\n'))
      .setFooter({ text: `Top ${topUsers.length} users in ${interaction.guild.name}` });

    await interaction.editReply({ embeds: [leaderboardEmbed] });
  },
};
