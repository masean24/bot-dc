const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');
const nobloxService = require('../../services/nobloxService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-cookie')
    .setDescription('Configure your cookie for settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((opt) => opt.setName('cookie').setDescription('Your .ROBLOSECURITY cookie').setRequired(true)),
  cooldown: 30,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const cookie = interaction.options.getString('cookie');

    const loggedIn = await nobloxService.loginWithCookie(cookie, interaction.guild.id);
    if (!loggedIn) {
      return interaction.editReply({ embeds: [embed.error('Invalid Cookie', 'Could not authenticate with Roblox. Make sure the cookie is valid and not expired.')] });
    }

    let guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildConfig) guildConfig = await Guild.create({ guildId: interaction.guild.id });

    guildConfig.roblox.cookie = cookie;
    await guildConfig.save();

    await interaction.editReply({
      embeds: [embed.success('✅ Cookie Set', 'Roblox cookie has been saved and authenticated successfully.\n\n⚠️ **Never share your cookie with anyone.**')],
    });
  },
};
