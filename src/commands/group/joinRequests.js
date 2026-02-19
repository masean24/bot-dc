const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');
const nobloxService = require('../../services/nobloxService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join-requests')
    .setDescription('Manage join requests for your group')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName('list')
        .setDescription('The list of join requests in your group')
    )
    .addSubcommand((sub) =>
      sub
        .setName('accept')
        .setDescription('Accept someone into your group')
        .addStringOption((opt) => opt.setName('username').setDescription('Roblox username to accept').setRequired(true))
    ),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    await interaction.deferReply();

    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildConfig?.roblox?.cookie || !guildConfig?.roblox?.groupId) {
      return interaction.editReply({ embeds: [embed.error('Not Configured', 'Roblox cookie or group ID not set.')] });
    }

    const loggedIn = await nobloxService.ensureLoggedIn(guildConfig.roblox.cookie, interaction.guild.id);
    if (!loggedIn) {
      return interaction.editReply({ embeds: [embed.error('Auth Error', 'Failed to authenticate with Roblox.')] });
    }

    const subcommand = interaction.options.getSubcommand();
    const groupId = Number(guildConfig.roblox.groupId);

    if (subcommand === 'list') {
      try {
        const requests = await nobloxService.getJoinRequests(groupId);
        const data = requests.data || requests;
        if (!data || !data.length) {
          return interaction.editReply({ embeds: [embed.info('📋 Join Requests', 'No pending join requests.')] });
        }

        const lines = data.slice(0, 20).map((r, i) => {
          const user = r.requester || r;
          return `**${i + 1}.** ${user.username || 'Unknown'} (ID: ${user.userId || 'N/A'})`;
        });

        await interaction.editReply({
          embeds: [embed.info(`📋 Join Requests (${data.length})`, lines.join('\n'))],
        });
      } catch (err) {
        await interaction.editReply({ embeds: [embed.error('Error', err.message)] });
      }
    }

    if (subcommand === 'accept') {
      const username = interaction.options.getString('username');
      const robloxService = require('../../services/robloxService');

      try {
        const robloxUser = await robloxService.getUserIdFromUsername(username);
        if (!robloxUser) {
          return interaction.editReply({ embeds: [embed.error('Not Found', `Roblox user "${username}" not found.`)] });
        }

        await nobloxService.acceptJoinRequest(groupId, Number(robloxUser.id));
        await interaction.editReply({
          embeds: [embed.success('✅ Request Accepted', `Accepted **${robloxUser.name}** into the group.`)],
        });
      } catch (err) {
        await interaction.editReply({ embeds: [embed.error('Error', err.message)] });
      }
    }
  },
};
