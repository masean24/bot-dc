const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');
const robloxService = require('../../services/robloxService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roblox-status')
    .setDescription('Get live info about a Roblox game')
    .addNumberOption((opt) =>
      opt.setName('placeid').setDescription('The Place ID of the Roblox game').setRequired(true)
    ),
  cooldown: 5,

  /**
   * Execute the roblox-status command.
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply();

    const placeId = String(Math.floor(interaction.options.getNumber('placeid')));

    const universeId = await robloxService.getUniverseIdFromPlaceId(placeId);
    if (!universeId) {
      return interaction.editReply({
        embeds: [
          embed.error(
            'Game Not Found',
            `Could not find a Roblox game with Place ID \`${placeId}\`. Make sure the ID is correct.`
          ),
        ],
      });
    }

    const game = await robloxService.getGameInfo(universeId);
    if (!game) {
      return interaction.editReply({
        embeds: [
          embed.error('API Error', 'Could not fetch game info from Roblox. Please try again later.'),
        ],
      });
    }

    const gameEmbed = embed
      .roblox(`🎮 ${game.name}`, game.description ? game.description.slice(0, 300) : 'No description.')
      .addFields(
        { name: '👥 Active Players', value: game.playing?.toLocaleString() ?? '0', inline: true },
        { name: '👀 Total Visits', value: game.visits?.toLocaleString() ?? '0', inline: true },
        { name: '❤️ Favorites', value: game.favoritedCount?.toLocaleString() ?? '0', inline: true },
        { name: '🏗️ Creator', value: game.creator?.name ?? 'Unknown', inline: true },
        { name: '🆔 Universe ID', value: String(universeId), inline: true },
        { name: '🆔 Place ID', value: placeId, inline: true }
      )
      .setURL(`https://www.roblox.com/games/${placeId}`)
      .setFooter({ text: 'Data from Roblox API • Cached for 60s' });

    await interaction.editReply({ embeds: [gameEmbed] });
  },
};
