const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure bot settings for this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommandGroup((group) =>
      group
        .setName('welcome')
        .setDescription('Welcome message settings')
        .addSubcommand((sub) =>
          sub
            .setName('channel')
            .setDescription('Set the welcome channel')
            .addChannelOption((opt) =>
              opt
                .setName('channel')
                .setDescription('The channel for welcome messages')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName('message')
            .setDescription('Set the welcome message (use {user} for mention)')
            .addStringOption((opt) =>
              opt.setName('message').setDescription('Welcome message text').setRequired(true)
            )
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('verification')
        .setDescription('Verification settings')
        .addSubcommand((sub) =>
          sub
            .setName('role')
            .setDescription('Set the role given on verification')
            .addRoleOption((opt) =>
              opt.setName('role').setDescription('The verified role').setRequired(true)
            )
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('roblox')
        .setDescription('Roblox integration settings')
        .addSubcommand((sub) =>
          sub
            .setName('group')
            .setDescription('Set the Roblox group ID')
            .addStringOption((opt) =>
              opt.setName('groupid').setDescription('Roblox group ID').setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName('minrank')
            .setDescription('Set the minimum group rank required')
            .addNumberOption((opt) =>
              opt.setName('rank').setDescription('Minimum rank number (0-255)').setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName('role')
            .setDescription('Set the role for Roblox group verified members')
            .addRoleOption((opt) =>
              opt.setName('role').setDescription('The Roblox verified role').setRequired(true)
            )
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('logging')
        .setDescription('Logging settings')
        .addSubcommand((sub) =>
          sub
            .setName('channel')
            .setDescription('Set the logging channel')
            .addChannelOption((opt) =>
              opt
                .setName('channel')
                .setDescription('The channel for log messages')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
    ),
  cooldown: 5,

  /**
   * Execute the config command.
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

    let guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildConfig) {
      guildConfig = await Guild.create({ guildId: interaction.guild.id });
    }

    const group = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();

    switch (group) {
      case 'welcome': {
        if (subcommand === 'channel') {
          const channel = interaction.options.getChannel('channel');
          guildConfig.welcome.enabled = true;
          guildConfig.welcome.channelId = channel.id;
          await guildConfig.save();

          return interaction.editReply({
            embeds: [
              embed.success(
                '✅ Welcome Channel Set',
                `Welcome messages will be sent to ${channel}.`
              ),
            ],
          });
        }

        if (subcommand === 'message') {
          const message = interaction.options.getString('message');
          guildConfig.welcome.message = message;
          await guildConfig.save();

          return interaction.editReply({
            embeds: [
              embed.success(
                '✅ Welcome Message Updated',
                `New welcome message:\n\`\`\`${message}\`\`\``
              ),
            ],
          });
        }
        break;
      }

      case 'verification': {
        if (subcommand === 'role') {
          const role = interaction.options.getRole('role');
          guildConfig.verification.enabled = true;
          guildConfig.verification.roleId = role.id;
          await guildConfig.save();

          return interaction.editReply({
            embeds: [
              embed.success(
                '✅ Verification Role Set',
                `Verified users will receive the ${role} role.`
              ),
            ],
          });
        }
        break;
      }

      case 'roblox': {
        if (subcommand === 'group') {
          const groupId = interaction.options.getString('groupid');
          guildConfig.roblox.verificationEnabled = true;
          guildConfig.roblox.groupId = groupId;
          await guildConfig.save();

          return interaction.editReply({
            embeds: [
              embed.success(
                '✅ Roblox Group Set',
                `Roblox group ID set to \`${groupId}\`.`
              ),
            ],
          });
        }

        if (subcommand === 'minrank') {
          const rank = interaction.options.getNumber('rank');
          guildConfig.roblox.minimumRank = rank;
          await guildConfig.save();

          return interaction.editReply({
            embeds: [
              embed.success(
                '✅ Minimum Rank Set',
                `Minimum Roblox group rank set to \`${rank}\`.`
              ),
            ],
          });
        }

        if (subcommand === 'role') {
          const role = interaction.options.getRole('role');
          guildConfig.roblox.verifiedRoleId = role.id;
          await guildConfig.save();

          return interaction.editReply({
            embeds: [
              embed.success(
                '✅ Roblox Verified Role Set',
                `Roblox group verified members will receive the ${role} role.`
              ),
            ],
          });
        }
        break;
      }

      case 'logging': {
        if (subcommand === 'channel') {
          const channel = interaction.options.getChannel('channel');
          guildConfig.logging.enabled = true;
          guildConfig.logging.channelId = channel.id;
          await guildConfig.save();

          return interaction.editReply({
            embeds: [
              embed.success(
                '✅ Logging Channel Set',
                `Bot logs will be sent to ${channel}.`
              ),
            ],
          });
        }
        break;
      }

      default: {
        return interaction.editReply({
          embeds: [embed.error('Error', 'Unknown configuration option.')],
        });
      }
    }
  },
};
