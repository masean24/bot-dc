const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');
const economyService = require('../../services/economyService');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top wallet and bank accounts in your server'),
  cooldown: 10,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    await interaction.deferReply();

    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    const currency = guildConfig?.economy?.currencyName || 'coins';

    const top = await economyService.getLeaderboard(interaction.guild.id, 10);
    if (!top.length) {
      return interaction.editReply({ embeds: [embed.info('💰 Leaderboard', 'No economy data yet.')] });
    }

    const lines = [];
    for (let i = 0; i < top.length; i++) {
      const entry = top[i];
      let username = 'Unknown';
      try {
        const user = await client.users.fetch(entry.discordId);
        username = user.displayName || user.username;
      } catch { /* skip */ }

      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
      lines.push(`${medal} ${username} — **${entry.total.toLocaleString()}** ${currency}`);
    }

    await interaction.editReply({
      embeds: [
        embed.info('💰 Economy Leaderboard', lines.join('\n'))
          .setFooter({ text: `Top ${top.length} in ${interaction.guild.name}` }),
      ],
    });
  },
};
