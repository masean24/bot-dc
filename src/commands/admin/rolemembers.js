const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolemembers')
    .setDescription('Check the members of a certain role')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption((opt) => opt.setName('role').setDescription('The role to check').setRequired(true)),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    await interaction.deferReply();

    const role = interaction.options.getRole('role');
    const members = role.members;

    if (!members.size) {
      return interaction.editReply({ embeds: [embed.info(`👥 ${role.name}`, 'No members have this role.')] });
    }

    const memberList = members.map((m) => m.user.tag);
    const maxDisplay = 50;
    const displayed = memberList.slice(0, maxDisplay);
    const remaining = memberList.length - maxDisplay;

    let description = displayed.join('\n');
    if (remaining > 0) {
      description += `\n\n*...and ${remaining} more*`;
    }

    await interaction.editReply({
      embeds: [
        embed.info(`👥 ${role.name} — ${members.size} member(s)`, description)
          .setColor(role.color || 0x5865f2),
      ],
    });
  },
};
