const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Manage roles for users')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add a role to someone')
        .addUserOption((opt) => opt.setName('user').setDescription('The user').setRequired(true))
        .addRoleOption((opt) => opt.setName('role').setDescription('The role to add').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove a role from someone')
        .addUserOption((opt) => opt.setName('user').setDescription('The user').setRequired(true))
        .addRoleOption((opt) => opt.setName('role').setDescription('The role to remove').setRequired(true))
    ),
  cooldown: 3,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({ embeds: [embed.error('Error', 'User not found in this server.')], ephemeral: true });
    }

    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ embeds: [embed.error('Error', 'I cannot manage this role. It is higher than or equal to my highest role.')], ephemeral: true });
    }

    await interaction.deferReply();

    if (sub === 'add') {
      if (member.roles.cache.has(role.id)) {
        return interaction.editReply({ embeds: [embed.warn('Already Has Role', `${user.tag} already has the ${role} role.`)] });
      }

      try {
        await member.roles.add(role);
        await interaction.editReply({ embeds: [embed.success('✅ Role Added', `Added ${role} to ${user.tag}.`)] });
      } catch (err) {
        await interaction.editReply({ embeds: [embed.error('Error', `Failed to add role: ${err.message}`)] });
      }
    }

    if (sub === 'remove') {
      if (!member.roles.cache.has(role.id)) {
        return interaction.editReply({ embeds: [embed.warn('Does Not Have Role', `${user.tag} does not have the ${role} role.`)] });
      }

      try {
        await member.roles.remove(role);
        await interaction.editReply({ embeds: [embed.success('✅ Role Removed', `Removed ${role} from ${user.tag}.`)] });
      } catch (err) {
        await interaction.editReply({ embeds: [embed.error('Error', `Failed to remove role: ${err.message}`)] });
      }
    }
  },
};
