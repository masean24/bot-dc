const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('Send a DM to someone as the bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption((opt) => opt.setName('user').setDescription('The user to DM').setRequired(true))
    .addStringOption((opt) => opt.setName('message').setDescription('The message to send').setRequired(true)),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const message = interaction.options.getString('message');

    await interaction.deferReply({ ephemeral: true });

    try {
      await user.send({
        embeds: [
          embed.info(`📬 Message from ${interaction.guild.name}`, message)
            .setFooter({ text: `Sent by ${interaction.user.tag}` }),
        ],
      });
      await interaction.editReply({ embeds: [embed.success('✅ DM Sent', `Message sent to ${user.tag}.`)] });
    } catch {
      await interaction.editReply({ embeds: [embed.error('Error', 'Could not DM this user. Their DMs may be closed.')] });
    }
  },
};
