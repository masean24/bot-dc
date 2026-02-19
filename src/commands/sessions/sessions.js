const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const Session = require('../../models/Session');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sessions')
    .setDescription('Manage sessions')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add a new session to the bot')
        .addStringOption((opt) => opt.setName('name').setDescription('Session name').setRequired(true))
        .addStringOption((opt) => opt.setName('type').setDescription('Session type (e.g. Training, Interview)').setRequired(true))
        .addStringOption((opt) => opt.setName('notes').setDescription('Additional notes'))
    )
    .addSubcommand((sub) =>
      sub
        .setName('edit')
        .setDescription('Edit a session on the bot')
        .addStringOption((opt) => opt.setName('name').setDescription('Session name to edit').setRequired(true))
        .addStringOption((opt) => opt.setName('type').setDescription('New session type'))
        .addStringOption((opt) => opt.setName('notes').setDescription('New notes'))
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
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const name = interaction.options.getString('name');
      const type = interaction.options.getString('type');
      const notes = interaction.options.getString('notes') || '';

      const existing = await Session.findOne({ guildId: interaction.guild.id, name, status: { $ne: 'ended' } });
      if (existing) {
        return interaction.editReply({ embeds: [embed.warn('Exists', `A session named **${name}** already exists.`)] });
      }

      await Session.create({
        guildId: interaction.guild.id,
        name,
        hostId: interaction.user.id,
        type,
        notes,
      });

      await interaction.editReply({
        embeds: [
          embed.success('✅ Session Created', '')
            .setDescription(null)
            .addFields(
              { name: 'Name', value: name, inline: true },
              { name: 'Type', value: type, inline: true },
              { name: 'Host', value: interaction.user.tag, inline: true },
              { name: 'Notes', value: notes || 'None' }
            ),
        ],
      });
    }

    if (sub === 'edit') {
      const name = interaction.options.getString('name');
      const session = await Session.findOne({ guildId: interaction.guild.id, name, status: { $ne: 'ended' } });
      if (!session) {
        return interaction.editReply({ embeds: [embed.error('Not Found', `Session **${name}** not found.`)] });
      }

      const newType = interaction.options.getString('type');
      const newNotes = interaction.options.getString('notes');

      if (newType) session.type = newType;
      if (newNotes !== null && newNotes !== undefined) session.notes = newNotes;
      await session.save();

      await interaction.editReply({
        embeds: [embed.success('✅ Session Updated', `Session **${name}** has been updated.`)],
      });
    }
  },
};
