const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');

const PUNS = [
  "I'm reading a book about anti-gravity. It's impossible to put down!",
  'Why don\'t scientists trust atoms? Because they make up everything!',
  'I used to hate facial hair, but then it grew on me.',
  'What do you call a fake noodle? An impasta!',
  'Why did the scarecrow win an award? He was outstanding in his field!',
  'I told my wife she was drawing her eyebrows too high. She looked surprised.',
  'What do you call a bear with no teeth? A gummy bear!',
  'Why don\'t eggs tell jokes? They\'d crack each other up!',
  'I\'m on a seafood diet. I see food and I eat it.',
  'What do you call a dog that does magic tricks? A Labracadabrador!',
  'Why did the bicycle fall over? Because it was two-tired!',
  'I would tell you a chemistry joke, but I know I wouldn\'t get a reaction.',
  'What did the ocean say to the beach? Nothing, it just waved.',
  'Why do cows have hooves instead of feet? Because they lactose!',
  'I\'m afraid for the calendar. Its days are numbered.',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pun')
    .setDescription('Puns!'),
  cooldown: 3,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const pun = PUNS[Math.floor(Math.random() * PUNS.length)];
    await interaction.reply({
      embeds: [embed.game('😄 Pun', pun)],
    });
  },
};
