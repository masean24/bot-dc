const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');
const Job = require('../../models/Job');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy')
    .setDescription('Economy configuration')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommandGroup((group) =>
      group
        .setName('jobs')
        .setDescription('Manage jobs')
        .addSubcommand((sub) =>
          sub
            .setName('add')
            .setDescription('Add a new job')
            .addStringOption((opt) => opt.setName('name').setDescription('Job name').setRequired(true))
            .addIntegerOption((opt) => opt.setName('minimum-reward').setDescription('Minimum reward').setRequired(true).setMinValue(1))
            .addIntegerOption((opt) => opt.setName('maximum-reward').setDescription('Maximum reward').setRequired(true).setMinValue(1))
            .addIntegerOption((opt) => opt.setName('firerate').setDescription('Fire rate % (0-100)').setRequired(true).setMinValue(0).setMaxValue(100))
        )
        .addSubcommand((sub) =>
          sub
            .setName('delete')
            .setDescription('Delete a job from the server')
            .addStringOption((opt) => opt.setName('name').setDescription('Job name to delete').setRequired(true))
        )
        .addSubcommand((sub) =>
          sub
            .setName('edit')
            .setDescription('Edit a job')
            .addStringOption((opt) => opt.setName('name').setDescription('Job name to edit').setRequired(true))
            .addIntegerOption((opt) => opt.setName('minimum-reward').setDescription('New minimum reward'))
            .addIntegerOption((opt) => opt.setName('maximum-reward').setDescription('New maximum reward'))
            .addIntegerOption((opt) => opt.setName('firerate').setDescription('New fire rate %'))
        )
        .addSubcommand((sub) =>
          sub
            .setName('view')
            .setDescription('View all jobs or a particular one')
            .addStringOption((opt) => opt.setName('name').setDescription('Job name (leave empty for all)'))
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('general')
        .setDescription('The general configuration')
        .addStringOption((opt) => opt.setName('currency').setDescription('Currency name'))
        .addIntegerOption((opt) => opt.setName('starting-balance').setDescription('Starting balance for new users').setMinValue(0))
        .addIntegerOption((opt) => opt.setName('work-cooldown').setDescription('Work cooldown in seconds').setMinValue(10))
    ),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const subGroup = interaction.options.getSubcommandGroup(false);
    const sub = interaction.options.getSubcommand();

    if (sub === 'general') {
      let guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
      if (!guildConfig) guildConfig = await Guild.create({ guildId: interaction.guild.id });

      const currency = interaction.options.getString('currency');
      const startBal = interaction.options.getInteger('starting-balance');
      const workCd = interaction.options.getInteger('work-cooldown');

      if (currency) guildConfig.economy.currencyName = currency;
      if (startBal !== null) guildConfig.economy.startingBalance = startBal;
      if (workCd !== null) guildConfig.economy.workCooldown = workCd;
      guildConfig.economy.enabled = true;
      await guildConfig.save();

      return interaction.editReply({
        embeds: [
          embed.success('✅ Economy Updated', '')
            .setDescription(null)
            .addFields(
              { name: 'Currency', value: guildConfig.economy.currencyName, inline: true },
              { name: 'Starting Balance', value: String(guildConfig.economy.startingBalance), inline: true },
              { name: 'Work Cooldown', value: `${guildConfig.economy.workCooldown}s`, inline: true }
            ),
        ],
      });
    }

    if (subGroup === 'jobs') {
      if (sub === 'add') {
        const name = interaction.options.getString('name');
        const minReward = interaction.options.getInteger('minimum-reward');
        const maxReward = interaction.options.getInteger('maximum-reward');
        const fireRate = interaction.options.getInteger('firerate');

        if (minReward > maxReward) {
          return interaction.editReply({ embeds: [embed.error('Error', 'Minimum reward cannot be greater than maximum reward.')] });
        }

        await Job.findOneAndUpdate(
          { guildId: interaction.guild.id, name },
          { guildId: interaction.guild.id, name, minReward, maxReward, fireRate },
          { upsert: true, new: true }
        );

        return interaction.editReply({ embeds: [embed.success('✅ Job Added', `Job **${name}** created (${minReward}-${maxReward}, ${fireRate}% fire rate).`)] });
      }

      if (sub === 'delete') {
        const name = interaction.options.getString('name');
        const deleted = await Job.findOneAndDelete({ guildId: interaction.guild.id, name });
        if (!deleted) {
          return interaction.editReply({ embeds: [embed.error('Not Found', `Job **${name}** not found.`)] });
        }
        return interaction.editReply({ embeds: [embed.success('✅ Job Deleted', `Job **${name}** has been removed.`)] });
      }

      if (sub === 'edit') {
        const name = interaction.options.getString('name');
        const job = await Job.findOne({ guildId: interaction.guild.id, name });
        if (!job) {
          return interaction.editReply({ embeds: [embed.error('Not Found', `Job **${name}** not found.`)] });
        }

        const minReward = interaction.options.getInteger('minimum-reward');
        const maxReward = interaction.options.getInteger('maximum-reward');
        const fireRate = interaction.options.getInteger('firerate');

        if (minReward !== null) job.minReward = minReward;
        if (maxReward !== null) job.maxReward = maxReward;
        if (fireRate !== null) job.fireRate = fireRate;
        await job.save();

        return interaction.editReply({ embeds: [embed.success('✅ Job Updated', `Job **${name}** updated (${job.minReward}-${job.maxReward}, ${job.fireRate}% fire rate).`)] });
      }

      if (sub === 'view') {
        const name = interaction.options.getString('name');
        if (name) {
          const job = await Job.findOne({ guildId: interaction.guild.id, name });
          if (!job) {
            return interaction.editReply({ embeds: [embed.error('Not Found', `Job **${name}** not found.`)] });
          }
          return interaction.editReply({
            embeds: [
              embed.info(`💼 ${job.name}`, '')
                .setDescription(null)
                .addFields(
                  { name: 'Min Reward', value: String(job.minReward), inline: true },
                  { name: 'Max Reward', value: String(job.maxReward), inline: true },
                  { name: 'Fire Rate', value: `${job.fireRate}%`, inline: true }
                ),
            ],
          });
        }

        const jobs = await Job.find({ guildId: interaction.guild.id });
        if (!jobs.length) {
          return interaction.editReply({ embeds: [embed.info('💼 Jobs', 'No jobs configured.')] });
        }

        const lines = jobs.map((j) => `**${j.name}** — ${j.minReward}-${j.maxReward} (${j.fireRate}% fire)`);
        return interaction.editReply({ embeds: [embed.info('💼 Jobs', lines.join('\n'))] });
      }
    }
  },
};
