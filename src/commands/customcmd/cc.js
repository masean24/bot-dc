const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const CustomCommand = require('../../models/CustomCommand');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cc')
    .setDescription('Custom command management')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add a custom command to the bot')
        .addStringOption((opt) => opt.setName('name').setDescription('Command trigger name').setRequired(true))
        .addStringOption((opt) => opt.setName('response').setDescription('Response message').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('delete')
        .setDescription('Delete a custom command from the bot')
        .addStringOption((opt) => opt.setName('name').setDescription('Command name to delete').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('edit')
        .setDescription('Edit a custom command on the bot')
        .addStringOption((opt) => opt.setName('name').setDescription('Command name to edit').setRequired(true))
        .addStringOption((opt) => opt.setName('response').setDescription('New response message').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('view')
        .setDescription('View a custom command or list of commands')
        .addStringOption((opt) => opt.setName('name').setDescription('Command name (leave empty for all)'))
    ),
  cooldown: 3,

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
      const name = interaction.options.getString('name').toLowerCase();
      const response = interaction.options.getString('response');

      const existing = await CustomCommand.findOne({ guildId: interaction.guild.id, name });
      if (existing) {
        return interaction.editReply({ embeds: [embed.warn('Exists', `Custom command \`${name}\` already exists. Use \`/cc edit\` to modify it.`)] });
      }

      await CustomCommand.create({
        guildId: interaction.guild.id,
        name,
        response,
        createdBy: interaction.user.id,
      });

      return interaction.editReply({ embeds: [embed.success('✅ Custom Command Added', `Command \`${name}\` created.\nTrigger it by typing \`!${name}\` in chat.`)] });
    }

    if (sub === 'delete') {
      const name = interaction.options.getString('name').toLowerCase();
      const deleted = await CustomCommand.findOneAndDelete({ guildId: interaction.guild.id, name });
      if (!deleted) {
        return interaction.editReply({ embeds: [embed.error('Not Found', `Custom command \`${name}\` not found.`)] });
      }
      return interaction.editReply({ embeds: [embed.success('✅ Custom Command Deleted', `Command \`${name}\` has been removed.`)] });
    }

    if (sub === 'edit') {
      const name = interaction.options.getString('name').toLowerCase();
      const response = interaction.options.getString('response');

      const cmd = await CustomCommand.findOne({ guildId: interaction.guild.id, name });
      if (!cmd) {
        return interaction.editReply({ embeds: [embed.error('Not Found', `Custom command \`${name}\` not found.`)] });
      }

      cmd.response = response;
      await cmd.save();
      return interaction.editReply({ embeds: [embed.success('✅ Custom Command Updated', `Command \`${name}\` response updated.`)] });
    }

    if (sub === 'view') {
      const name = interaction.options.getString('name');

      if (name) {
        const cmd = await CustomCommand.findOne({ guildId: interaction.guild.id, name: name.toLowerCase() });
        if (!cmd) {
          return interaction.editReply({ embeds: [embed.error('Not Found', `Custom command \`${name}\` not found.`)] });
        }
        return interaction.editReply({
          embeds: [
            embed.info(`📝 Custom Command: ${cmd.name}`, '')
              .setDescription(null)
              .addFields(
                { name: 'Trigger', value: `\`!${cmd.name}\``, inline: true },
                { name: 'Created By', value: `<@${cmd.createdBy}>`, inline: true },
                { name: 'Response', value: cmd.response.slice(0, 1024) }
              ),
          ],
        });
      }

      const cmds = await CustomCommand.find({ guildId: interaction.guild.id });
      if (!cmds.length) {
        return interaction.editReply({ embeds: [embed.info('📝 Custom Commands', 'No custom commands configured.')] });
      }

      const lines = cmds.map((c) => `\`!${c.name}\` — ${c.response.slice(0, 50)}${c.response.length > 50 ? '...' : ''}`);
      return interaction.editReply({
        embeds: [embed.info(`📝 Custom Commands (${cmds.length})`, lines.join('\n'))],
      });
    }
  },
};
