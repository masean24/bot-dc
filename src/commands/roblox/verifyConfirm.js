const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');
const robloxService = require('../../services/robloxService');
const Verification = require('../../models/Verification');
const User = require('../../models/User');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify-confirm')
    .setDescription('Confirm your Roblox verification after adding the code to your bio'),
  cooldown: 10,

  /**
   * Execute the verify-confirm command.
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

    const pending = await Verification.findOne({
      discordId: interaction.user.id,
      guildId: interaction.guild.id,
    });

    if (!pending) {
      return interaction.editReply({
        embeds: [
          embed.error(
            'No Pending Verification',
            'You have no pending verification. Use `/verify` first or your code may have expired.'
          ),
        ],
      });
    }

    const profile = await robloxService.getUserProfile(pending.robloxUserId);
    if (!profile) {
      return interaction.editReply({
        embeds: [embed.error('API Error', 'Could not fetch your Roblox profile. Please try again later.')],
      });
    }

    const bio = profile.description || '';
    if (!bio.includes(pending.code)) {
      return interaction.editReply({
        embeds: [
          embed.error(
            '❌ Code Not Found',
            [
              `Could not find the code \`${pending.code}\` in your Roblox bio.`,
              '',
              '**Make sure you:**',
              '1. Added the code to your Roblox **About/Bio** section',
              '2. Saved your profile changes',
              '3. The code has not expired',
              '',
              'Try again with `/verify-confirm` after updating your bio.',
            ].join('\n')
          ),
        ],
      });
    }

    await User.findOneAndUpdate(
      { discordId: interaction.user.id, guildId: interaction.guild.id },
      {
        discordId: interaction.user.id,
        guildId: interaction.guild.id,
        robloxUserId: pending.robloxUserId,
        robloxUsername: pending.robloxUsername,
        verified: true,
        verifiedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    await Verification.deleteOne({ _id: pending._id });

    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    let roleAssigned = false;

    if (guildConfig?.verification?.roleId) {
      try {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        await member.roles.add(guildConfig.verification.roleId);
        roleAssigned = true;
      } catch {
        // Bot may lack permissions
      }
    }

    const description = [
      `✅ You are now verified as **${pending.robloxUsername}**!`,
      '',
      roleAssigned
        ? '🎭 Your verified role has been assigned.'
        : '⚠️ No verified role is configured for this server. Ask an admin to set one with `/config verification role`.',
    ].join('\n');

    await interaction.editReply({
      embeds: [embed.success('🎉 Verification Complete', description)],
    });
  },
};
