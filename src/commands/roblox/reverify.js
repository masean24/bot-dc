const { SlashCommandBuilder } = require('discord.js');
const crypto = require('node:crypto');
const embed = require('../../utils/embed');
const robloxService = require('../../services/robloxService');
const Verification = require('../../models/Verification');
const User = require('../../models/User');
const { VERIFICATION_CODE_LENGTH, VERIFICATION_EXPIRY_MINUTES } = require('../../config/constants');

/**
 * Generate a random alphanumeric code.
 * @param {number} length
 * @returns {string}
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
    .setName('reverify')
    .setDescription('Change your connected Roblox account')
    .addStringOption((opt) =>
      opt.setName('username').setDescription('Your new Roblox username').setRequired(true)
    ),
  cooldown: 15,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'This command can only be used in a server.')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const existingUser = await User.findOne({ discordId: interaction.user.id, guildId: interaction.guild.id });
    if (!existingUser || !existingUser.verified) {
      return interaction.editReply({
        embeds: [embed.warn('Not Verified', 'You are not currently verified. Use `/verify` instead.')],
      });
    }

    const username = interaction.options.getString('username');
    const robloxUser = await robloxService.getUserIdFromUsername(username);
    if (!robloxUser) {
      return interaction.editReply({ embeds: [embed.error('User Not Found', `Could not find Roblox user **${username}**.`)] });
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

    try {
      await interaction.user.send({
        embeds: [
          embed.roblox('🔄 Re-Verification', [
            `You are changing your linked Roblox account to **${robloxUser.name}**.`,
            '',
            `Add this code to your Roblox bio:`,
            `\`\`\`${code}\`\`\``,
            `Then run \`/verify-confirm\`. Code expires in **${VERIFICATION_EXPIRY_MINUTES} minutes**.`,
          ].join('\n')),
        ],
      });
      await interaction.editReply({ embeds: [embed.success('📬 Check Your DMs!', 'Re-verification instructions sent to your DMs.')] });
    } catch {
      await interaction.editReply({
        embeds: [embed.warn('⚠️ Could Not DM You', `Add this code to your Roblox bio:\n\`\`\`${code}\`\`\`\nThen run \`/verify-confirm\`.`)],
      });
    }
  },
};
