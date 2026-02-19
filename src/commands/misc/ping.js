const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the latency of the bot'),
  cooldown: 3,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const sent = await interaction.reply({ embeds: [embed.info('🏓 Pinging...', 'Calculating...')], fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    await interaction.editReply({
      embeds: [
        embed.info('🏓 Pong!', '')
          .setDescription(null)
          .addFields(
            { name: 'Bot Latency', value: `${latency}ms`, inline: true },
            { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
          ),
      ],
    });
  },
};
