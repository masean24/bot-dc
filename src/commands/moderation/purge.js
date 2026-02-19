const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Purge messages in a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((opt) =>
      opt.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)
    )
    .addUserOption((opt) => opt.setName('user').setDescription('Only delete messages from this user')),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    try {
      let messages = await interaction.channel.messages.fetch({ limit: amount });

      if (targetUser) {
        messages = messages.filter((m) => m.author.id === targetUser.id);
      }

      const deleted = await interaction.channel.bulkDelete(messages, true);

      await interaction.editReply({
        embeds: [embed.success('🗑️ Messages Purged', `Deleted **${deleted.size}** message(s).${targetUser ? ` from ${targetUser.tag}` : ''}`)],
      });
    } catch {
      await interaction.editReply({ embeds: [embed.error('Error', 'Failed to delete messages. Messages older than 14 days cannot be bulk deleted.')] });
    }
  },
};
