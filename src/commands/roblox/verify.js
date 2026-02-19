const { SlashCommandBuilder } = require('discord.js');
const crypto = require('node:crypto');
const embed = require('../../utils/embed');
const robloxService = require('../../services/robloxService');
const Verification = require('../../models/Verification');
const { VERIFICATION_CODE_LENGTH, VERIFICATION_EXPIRY_MINUTES } = require('../../config/constants');

/**
 * Generate a random alphanumeric code.
 * @param {number} length - Code length
 * @returns {string} Random code
 */
function generateCode(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Link your Roblox account to your Discord account')
    .addStringOption((opt) =>
      opt.setName('username').setDescription('Your Roblox username').setRequired(true)
    ),
  cooldown: 10,

  /**
   * Execute the verify command.
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

    const username = interaction.options.getString('username');

    const robloxUser = await robloxService.getUserIdFromUsername(username);
    if (!robloxUser) {
      return interaction.editReply({
        embeds: [embed.error('User Not Found', `Could not find a Roblox user named **${username}**.`)],
      });
    }

    const code = generateCode(VERIFICATION_CODE_LENGTH);
    const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_MINUTES * 60 * 1000);

    await Verification.findOneAndUpdate(
      { discordId: interaction.user.id, guildId: interaction.guild.id },
      {
        discordId: interaction.user.id,
        guildId: interaction.guild.id,
        robloxUserId: robloxUser.id,
        robloxUsername: robloxUser.name,
        code,
        expiresAt,
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    const dmEmbed = embed.roblox(
      '🔗 Roblox Verification',
      [
        `Please add the following code to your **Roblox bio**:`,
        '',
        `\`\`\`${code}\`\`\``,
        '',
        `Then run \`/verify-confirm\` in the server.`,
        `This code expires in **${VERIFICATION_EXPIRY_MINUTES} minutes**.`,
      ].join('\n')
    ).addFields(
      { name: 'Roblox Account', value: robloxUser.name, inline: true },
      { name: 'Server', value: interaction.guild.name, inline: true }
    );

    try {
      await interaction.user.send({ embeds: [dmEmbed] });
      await interaction.editReply({
        embeds: [embed.success('📬 Check Your DMs!', 'Verification instructions have been sent to your DMs.')],
      });
    } catch {
      await interaction.editReply({
        embeds: [
          embed.warn(
            '⚠️ Could Not DM You',
            [
              'Please enable DMs from server members and try again.',
              '',
              'In the meantime, add this code to your Roblox bio:',
              `\`\`\`${code}\`\`\``,
              `Then run \`/verify-confirm\`. Code expires in **${VERIFICATION_EXPIRY_MINUTES} minutes**.`,
            ].join('\n')
          ),
        ],
      });
    }
  },
};
