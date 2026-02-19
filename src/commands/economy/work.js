const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');
const Economy = require('../../models/Economy');
const Job = require('../../models/Job');
const Guild = require('../../models/Guild');
const economyService = require('../../services/economyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Earn some money to put in your wallet!'),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
    const currency = guildConfig?.economy?.currencyName || 'coins';
    const cooldownSec = guildConfig?.economy?.workCooldown || 60;

    let profile = await economyService.getProfile(interaction.user.id, interaction.guild.id, guildConfig?.economy?.startingBalance || 0);

    if (profile.lastWork) {
      const diff = Date.now() - profile.lastWork.getTime();
      const remaining = (cooldownSec * 1000) - diff;
      if (remaining > 0) {
        const secs = Math.ceil(remaining / 1000);
        return interaction.reply({
          embeds: [embed.warn('⏳ Cooldown', `You can work again in **${secs}** second(s).`)],
          ephemeral: true,
        });
      }
    }

    let minReward = 50;
    let maxReward = 200;
    let jobName = 'Freelancer';

    if (profile.job) {
      const job = await Job.findOne({ guildId: interaction.guild.id, name: profile.job });
      if (job) {
        minReward = job.minReward;
        maxReward = job.maxReward;
        jobName = job.name;

        const fireChance = Math.random() * 100;
        if (fireChance < job.fireRate) {
          profile.job = null;
          profile.lastWork = new Date();
          await profile.save();
          return interaction.reply({
            embeds: [embed.error('🔥 You got fired!', `You were fired from your job as **${jobName}**. Use \`/choose-job\` to find a new one.`)],
          });
        }
      }
    }

    const earned = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;

    await Economy.findOneAndUpdate(
      { discordId: interaction.user.id, guildId: interaction.guild.id },
      { $inc: { wallet: earned }, lastWork: new Date() },
      { upsert: true }
    );

    const { Transaction } = require('../../models/Transaction');
    try {
      await require('../../models/Transaction').create({
        discordId: interaction.user.id,
        guildId: interaction.guild.id,
        type: 'work',
        amount: earned,
        description: `Worked as ${jobName}`,
      });
    } catch {
      // Non-critical
    }

    await interaction.reply({
      embeds: [
        embed.success('💼 Work Complete', `You worked as a **${jobName}** and earned **${earned.toLocaleString()} ${currency}**!`),
      ],
    });
  },
};
