const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');
const RankBinding = require('../../models/RankBinding');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bind')
    .setDescription('Bind a Roblox rank to a Discord role')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((sub) =>
      sub
        .setName('role')
        .setDescription('Bind a Roblox rank to a Discord role')
        .addRoleOption((opt) => opt.setName('role').setDescription('The Discord role').setRequired(true))
        .addIntegerOption((opt) => opt.setName('rank').setDescription('Minimum Roblox rank number (0-255)').setRequired(true).setMinValue(0).setMaxValue(255))
        .addStringOption((opt) => opt.setName('rankname').setDescription('Name for this rank (optional)'))
    ),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildConfig?.roblox?.groupId) {
      return interaction.editReply({ embeds: [embed.error('Not Configured', 'No Roblox group configured. Use `/config roblox group` first.')] });
    }

    const role = interaction.options.getRole('role');
    const rank = interaction.options.getInteger('rank');
    const rankName = interaction.options.getString('rankname') || '';

    await RankBinding.findOneAndUpdate(
      { guildId: interaction.guild.id, groupId: guildConfig.roblox.groupId, robloxRankId: rank },
      {
        guildId: interaction.guild.id,
        groupId: guildConfig.roblox.groupId,
        robloxRankId: rank,
        robloxRankName: rankName,
        discordRoleId: role.id,
      },
      { upsert: true, new: true }
    );

    await interaction.editReply({
      embeds: [
        embed.success('🔗 Rank Binding Created', '')
          .setDescription(null)
          .addFields(
            { name: 'Discord Role', value: `${role}`, inline: true },
            { name: 'Roblox Rank', value: `${rankName || 'N/A'} (≥${rank})`, inline: true },
            { name: 'Group ID', value: guildConfig.roblox.groupId, inline: true }
          ),
      ],
    });
  },
};
