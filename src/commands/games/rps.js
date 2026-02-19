const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');

const CHOICES = ['rock', 'paper', 'scissors'];
const EMOJIS = { rock: '🪨', paper: '📄', scissors: '✂️' };

/**
 * Determine the winner of rock-paper-scissors.
 * @param {string} userChoice
 * @param {string} botChoice
 * @returns {'win'|'lose'|'tie'}
 */
function determineResult(userChoice, botChoice) {
  if (userChoice === botChoice) return 'tie';
  if (
    (userChoice === 'rock' && botChoice === 'scissors') ||
    (userChoice === 'paper' && botChoice === 'rock') ||
    (userChoice === 'scissors' && botChoice === 'paper')
  ) {
    return 'win';
  }
  return 'lose';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play Rock Paper Scissors against the bot')
    .addStringOption((opt) =>
      opt
        .setName('choice')
        .setDescription('Your choice')
        .setRequired(true)
        .addChoices(
          { name: 'Rock 🪨', value: 'rock' },
          { name: 'Paper 📄', value: 'paper' },
          { name: 'Scissors ✂️', value: 'scissors' }
        )
    ),
  cooldown: 3,

  /**
   * Execute the rps command.
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    const userChoice = interaction.options.getString('choice');
    const botChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    const result = determineResult(userChoice, botChoice);

    const titles = {
      win: '🎉 You Win!',
      lose: '😢 You Lose!',
      tie: '🤝 It\'s a Tie!',
    };

    const colors = {
      win: 'success',
      lose: 'error',
      tie: 'warn',
    };

    const resultEmbed = embed[colors[result]](titles[result], '')
      .setDescription(null)
      .addFields(
        { name: 'Your Choice', value: `${EMOJIS[userChoice]} ${userChoice}`, inline: true },
        { name: 'Bot\'s Choice', value: `${EMOJIS[botChoice]} ${botChoice}`, inline: true }
      );

    await interaction.reply({ embeds: [resultEmbed] });
  },
};
