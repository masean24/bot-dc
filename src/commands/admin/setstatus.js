const { SlashCommandBuilder, PermissionFlagsBits, ActivityType } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setstatus')
    .setDescription('Change the bot\'s status')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((opt) => opt.setName('status').setDescription('Status text').setRequired(true))
    .addStringOption((opt) =>
      opt.setName('type').setDescription('Activity type').addChoices(
        { name: 'Playing', value: 'Playing' },
        { name: 'Watching', value: 'Watching' },
        { name: 'Listening', value: 'Listening' },
        { name: 'Competing', value: 'Competing' }
      )
    ),
  cooldown: 10,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const statusText = interaction.options.getString('status');
    const type = interaction.options.getString('type') || 'Playing';

    const activityMap = {
      Playing: ActivityType.Playing,
      Watching: ActivityType.Watching,
      Listening: ActivityType.Listening,
      Competing: ActivityType.Competing,
    };

    client.user.setActivity(statusText, { type: activityMap[type] });

    if (interaction.guild) {
      let guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
      if (guildConfig) {
        guildConfig.customStatus = `${type}: ${statusText}`;
        await guildConfig.save();
      }
    }

    await interaction.reply({
      embeds: [embed.success('✅ Status Updated', `Bot status set to **${type} ${statusText}**`)],
      ephemeral: true,
    });
  },
};
