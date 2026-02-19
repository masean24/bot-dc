const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embed = require('../../utils/embed');

const MAX_ATTEMPTS = 3;
const MAX_NUMBER = 10;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guessnumber')
    .setDescription('Guess a number between 1 and 10 — you get 3 attempts!'),
  cooldown: 10,

  /**
   * Execute the guessnumber command.
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    const target = Math.floor(Math.random() * MAX_NUMBER) + 1;
    let attemptsLeft = MAX_ATTEMPTS;

    /**
     * Build button rows for numbers 1-10.
     * @param {Set<number>} disabled - Numbers already guessed
     * @returns {ActionRowBuilder[]}
     */
    function buildRows(disabled = new Set()) {
      const row1 = new ActionRowBuilder();
      const row2 = new ActionRowBuilder();
      for (let i = 1; i <= 5; i++) {
        row1.addComponents(
          new ButtonBuilder()
            .setCustomId(`guess_${i}`)
            .setLabel(String(i))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disabled.has(i))
        );
      }
      for (let i = 6; i <= 10; i++) {
        row2.addComponents(
          new ButtonBuilder()
            .setCustomId(`guess_${i}`)
            .setLabel(String(i))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disabled.has(i))
        );
      }
      return [row1, row2];
    }

    const startEmbed = embed.game(
      '🔢 Guess the Number',
      `I'm thinking of a number between **1** and **${MAX_NUMBER}**.\nYou have **${attemptsLeft}** attempts. Pick a number!`
    );

    const msg = await interaction.reply({
      embeds: [startEmbed],
      components: buildRows(),
      fetchReply: true,
    });

    const disabled = new Set();

    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id && i.customId.startsWith('guess_'),
      time: 60_000,
    });

    collector.on('collect', async (btnInteraction) => {
      const guess = parseInt(btnInteraction.customId.split('_')[1], 10);
      disabled.add(guess);
      attemptsLeft--;

      if (guess === target) {
        collector.stop('won');
        const winEmbed = embed.success(
          '🎉 Correct!',
          `The number was **${target}**! You guessed it with **${attemptsLeft}** attempt(s) remaining.`
        );
        await btnInteraction.update({ embeds: [winEmbed], components: [] });
        return;
      }

      if (attemptsLeft <= 0) {
        collector.stop('lost');
        const loseEmbed = embed.error(
          '😢 Out of Attempts',
          `The number was **${target}**. Better luck next time!`
        );
        await btnInteraction.update({ embeds: [loseEmbed], components: [] });
        return;
      }

      const hint = guess < target ? '📈 Too low!' : '📉 Too high!';
      const continueEmbed = embed.game(
        '🔢 Guess the Number',
        `${hint}\nYou have **${attemptsLeft}** attempt(s) remaining.`
      );

      await btnInteraction.update({
        embeds: [continueEmbed],
        components: buildRows(disabled),
      });
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') {
        const timeoutEmbed = embed.warn(
          '⏰ Time\'s Up!',
          `The number was **${target}**. You ran out of time!`
        );
        await interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
      }
    });
  },
};
