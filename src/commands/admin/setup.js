const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Initialize the bot configuration for this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  cooldown: 10,

  /**
   * Execute the setup command.
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({
        embeds: [embed.error('Error', 'This command can only be used in a server.')],
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const existing = await Guild.findOne({ guildId: interaction.guild.id });

    if (existing) {
      return interaction.editReply({
        embeds: [
          embed.info(
            'ℹ️ Already Configured',
            'This server already has a configuration. Use `/config` to update settings.'
          ),
        ],
      });
    }

    await Guild.create({ guildId: interaction.guild.id });

    await interaction.editReply({
      embeds: [
        embed.success(
          '✅ Setup Complete',
          [
            'Server configuration has been initialized with default settings.',
            '',
            '**Next steps:**',
            '• `/config welcome channel` — Set a welcome channel',
            '• `/config verification role` — Set a verified role',
            '• `/config roblox group` — Link a Roblox group',
            '• `/config logging channel` — Set a logging channel',
          ].join('\n')
        ),
      ],
    });
  },
};
