const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');
const robloxService = require('../../services/robloxService');
const nobloxService = require('../../services/nobloxService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hasgamepass')
    .setDescription('Check if someone has a certain gamepass')
    .addStringOption((opt) => opt.setName('username').setDescription('Roblox username').setRequired(true))
    .addStringOption((opt) => opt.setName('gamepassid').setDescription('Gamepass ID').setRequired(true)),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    await interaction.deferReply();

    const username = interaction.options.getString('username');
    const gamepassId = interaction.options.getString('gamepassid');

    const robloxUser = await robloxService.getUserIdFromUsername(username);
    if (!robloxUser) {
      return interaction.editReply({ embeds: [embed.error('Not Found', `Roblox user "${username}" not found.`)] });
    }

    try {
      const owns = await nobloxService.userOwnsGamepass(Number(robloxUser.id), Number(gamepassId));
      if (owns) {
        await interaction.editReply({
          embeds: [embed.success('✅ Has Gamepass', `**${robloxUser.name}** owns gamepass \`${gamepassId}\`.`)],
        });
      } else {
        await interaction.editReply({
          embeds: [embed.error('❌ Does Not Have Gamepass', `**${robloxUser.name}** does not own gamepass \`${gamepassId}\`.`)],
        });
      }
    } catch (err) {
      await interaction.editReply({ embeds: [embed.error('Error', err.message)] });
    }
  },
};
