const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const embed = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Bored? Meme time!'),
  cooldown: 3,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const { data } = await axios.get('https://meme-api.com/gimme');
      const memeEmbed = embed.game(`😂 ${data.title}`, '')
        .setDescription(null)
        .setImage(data.url)
        .setFooter({ text: `👍 ${data.ups} | r/${data.subreddit}` });

      await interaction.editReply({ embeds: [memeEmbed] });
    } catch {
      await interaction.editReply({ embeds: [embed.error('Error', 'Could not fetch a meme right now. Try again later!')] });
    }
  },
};
