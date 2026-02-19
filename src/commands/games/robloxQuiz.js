const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embed = require('../../utils/embed');
const QuizScore = require('../../models/QuizScore');
const { QUIZ_QUESTIONS } = require('../../config/constants');

const LABELS = ['A', 'B', 'C', 'D'];
const STYLES = [ButtonStyle.Primary, ButtonStyle.Primary, ButtonStyle.Primary, ButtonStyle.Primary];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roblox-quiz')
    .setDescription('Test your Roblox knowledge with a trivia question!'),
  cooldown: 5,

  /**
   * Execute the roblox-quiz command.
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

    const question = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];

    const optionsText = question.options
      .map((opt, i) => `**${LABELS[i]}.** ${opt}`)
      .join('\n');

    const questionEmbed = embed.game(
      '🧠 Roblox Trivia',
      `${question.question}\n\n${optionsText}`
    );

    const row = new ActionRowBuilder();
    for (let i = 0; i < question.options.length; i++) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`quiz_${i}`)
          .setLabel(LABELS[i])
          .setStyle(STYLES[i])
      );
    }

    const msg = await interaction.reply({
      embeds: [questionEmbed],
      components: [row],
      fetchReply: true,
    });

    try {
      const btnInteraction = await msg.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id && i.customId.startsWith('quiz_'),
        time: 30_000,
      });

      const selected = parseInt(btnInteraction.customId.split('_')[1], 10);
      const isCorrect = selected === question.answer;

      const updateData = {
        $inc: { totalAttempts: 1 },
      };
      if (isCorrect) {
        updateData.$inc.score = 1;
      }

      const scoreDoc = await QuizScore.findOneAndUpdate(
        { discordId: interaction.user.id, guildId: interaction.guild.id },
        updateData,
        { upsert: true, new: true }
      );

      const correctAnswer = `**${LABELS[question.answer]}.** ${question.options[question.answer]}`;

      if (isCorrect) {
        const correctEmbed = embed.success(
          '✅ Correct!',
          [
            `The answer was: ${correctAnswer}`,
            '',
            `📊 Your score: **${scoreDoc.score}** / **${scoreDoc.totalAttempts}** (${Math.round((scoreDoc.score / scoreDoc.totalAttempts) * 100)}%)`,
          ].join('\n')
        );
        await btnInteraction.update({ embeds: [correctEmbed], components: [] });
      } else {
        const wrongEmbed = embed.error(
          '❌ Wrong!',
          [
            `The correct answer was: ${correctAnswer}`,
            `You chose: **${LABELS[selected]}.** ${question.options[selected]}`,
            '',
            `📊 Your score: **${scoreDoc.score}** / **${scoreDoc.totalAttempts}** (${Math.round((scoreDoc.score / scoreDoc.totalAttempts) * 100)}%)`,
          ].join('\n')
        );
        await btnInteraction.update({ embeds: [wrongEmbed], components: [] });
      }
    } catch {
      const timeoutEmbed = embed.warn(
        '⏰ Time\'s Up!',
        `You didn't answer in time. The correct answer was: **${LABELS[question.answer]}.** ${question.options[question.answer]}`
      );
      await interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
    }
  },
};
