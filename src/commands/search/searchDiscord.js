const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');
const User = require('../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for users')
    .addSubcommand((sub) =>
      sub
        .setName('discord')
        .setDescription('Search for someone using their Discord account')
        .addUserOption((opt) => opt.setName('user').setDescription('The Discord user').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('roblox')
        .setDescription('Search for someone using their Roblox username')
        .addStringOption((opt) => opt.setName('username').setDescription('Roblox username').setRequired(true))
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
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'discord') {
      const user = interaction.options.getUser('user');
      const userDoc = await User.findOne({ discordId: user.id, guildId: interaction.guild.id });

      if (!userDoc || !userDoc.verified) {
        return interaction.editReply({ embeds: [embed.warn('Not Found', `${user.tag} is not verified in this server.`)] });
      }

      await interaction.editReply({
        embeds: [
          embed.roblox('🔍 User Found', '')
            .setDescription(null)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
              { name: 'Discord', value: `${user.tag} (${user.id})`, inline: true },
              { name: 'Roblox', value: `[${userDoc.robloxUsername}](https://www.roblox.com/users/${userDoc.robloxUserId}/profile)`, inline: true },
              { name: 'Roblox ID', value: userDoc.robloxUserId, inline: true },
              { name: 'Verified At', value: userDoc.verifiedAt ? `<t:${Math.floor(userDoc.verifiedAt.getTime() / 1000)}:R>` : 'N/A', inline: true }
            ),
        ],
      });
    }

    if (subcommand === 'roblox') {
      const username = interaction.options.getString('username');
      const userDoc = await User.findOne({
        guildId: interaction.guild.id,
        robloxUsername: { $regex: new RegExp(`^${username}$`, 'i') },
        verified: true,
      });

      if (!userDoc) {
        return interaction.editReply({ embeds: [embed.warn('Not Found', `No verified user with Roblox username **${username}** found in this server.`)] });
      }

      let discordUser = null;
      try {
        discordUser = await client.users.fetch(userDoc.discordId);
      } catch {
        // User may have left
      }

      await interaction.editReply({
        embeds: [
          embed.roblox('🔍 User Found', '')
            .setDescription(null)
            .addFields(
              { name: 'Roblox', value: `[${userDoc.robloxUsername}](https://www.roblox.com/users/${userDoc.robloxUserId}/profile)`, inline: true },
              { name: 'Roblox ID', value: userDoc.robloxUserId, inline: true },
              { name: 'Discord', value: discordUser ? `${discordUser.tag} (${discordUser.id})` : userDoc.discordId, inline: true },
              { name: 'Verified At', value: userDoc.verifiedAt ? `<t:${Math.floor(userDoc.verifiedAt.getTime() / 1000)}:R>` : 'N/A', inline: true }
            ),
        ],
      });
    }
  },
};
