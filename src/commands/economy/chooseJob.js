const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const embed = require('../../utils/embed');
const Job = require('../../models/Job');
const Economy = require('../../models/Economy');
const economyService = require('../../services/economyService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('choose-job')
    .setDescription('Change your profession'),
  cooldown: 10,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    const jobs = await Job.find({ guildId: interaction.guild.id });
    if (!jobs.length) {
      return interaction.reply({ embeds: [embed.warn('No Jobs', 'No jobs have been configured for this server. Ask an admin to add some with `/economy jobs add`.')], ephemeral: true });
    }

    const options = jobs.map((j) => ({
      label: j.name,
      description: `Reward: ${j.minReward}-${j.maxReward} | Fire rate: ${j.fireRate}%`,
      value: j.name,
    }));

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('choose_job')
        .setPlaceholder('Select a job...')
        .addOptions(options)
    );

    const msg = await interaction.reply({
      embeds: [embed.info('💼 Choose a Job', 'Select a job from the menu below:')],
      components: [row],
      fetchReply: true,
    });

    try {
      const selectInteraction = await msg.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id && i.customId === 'choose_job',
        time: 30_000,
      });

      const selectedJob = selectInteraction.values[0];

      await Economy.findOneAndUpdate(
        { discordId: interaction.user.id, guildId: interaction.guild.id },
        { job: selectedJob },
        { upsert: true }
      );

      await selectInteraction.update({
        embeds: [embed.success('✅ Job Selected', `You are now working as a **${selectedJob}**!`)],
        components: [],
      });
    } catch {
      await interaction.editReply({
        embeds: [embed.warn('⏰ Timed Out', 'You did not select a job in time.')],
        components: [],
      }).catch(() => {});
    }
  },
};
