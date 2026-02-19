const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');
const User = require('../../models/User');
const nobloxService = require('../../services/nobloxService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getrank')
    .setDescription('Check someone\'s rank in a certain group')
    .addUserOption((opt) => opt.setName('user').setDescription('The Discord user to check').setRequired(true)),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    await interaction.deferReply();

    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildConfig?.roblox?.groupId) {
      return interaction.editReply({ embeds: [embed.error('Not Configured', 'No Roblox group configured for this server.')] });
    }

    const targetUser = interaction.options.getUser('user');
    const userDoc = await User.findOne({ discordId: targetUser.id, guildId: interaction.guild.id, verified: true });
    if (!userDoc) {
      return interaction.editReply({ embeds: [embed.error('Not Verified', `${targetUser.tag} is not verified.`)] });
    }

    try {
      const rankInfo = await nobloxService.getRankInGroup(Number(guildConfig.roblox.groupId), Number(userDoc.robloxUserId));
      if (!rankInfo || rankInfo.rank === 0) {
        return interaction.editReply({ embeds: [embed.warn('Not In Group', `${userDoc.robloxUsername} is not a member of the configured group.`)] });
      }

      await interaction.editReply({
        embeds: [
          embed.roblox('📊 Group Rank', '')
            .setDescription(null)
            .addFields(
              { name: 'Roblox User', value: userDoc.robloxUsername, inline: true },
              { name: 'Rank', value: `${rankInfo.name} (${rankInfo.rank})`, inline: true },
              { name: 'Group ID', value: guildConfig.roblox.groupId, inline: true }
            ),
        ],
      });
    } catch (err) {
      await interaction.editReply({ embeds: [embed.error('Error', err.message)] });
    }
  },
};
