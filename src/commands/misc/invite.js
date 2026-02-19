const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Invite the bot to your server'),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;

    await interaction.reply({
      embeds: [
        embed.info('🔗 Invite', `[Click here to invite the bot](${inviteUrl})`)
          .setThumbnail(client.user.displayAvatarURL()),
      ],
      ephemeral: true,
    });
  },
};
