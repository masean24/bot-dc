const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');

const RESPONSES = [
  'It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes definitely.',
  'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.',
  'Yes.', 'Signs point to yes.', 'Reply hazy, try again.', 'Ask again later.',
  'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.',
  "Don't count on it.", 'My reply is no.', 'My sources say no.',
  'Outlook not so good.', 'Very doubtful.',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask our magic 8ball anything!')
    .addStringOption((opt) => opt.setName('question').setDescription('Your question').setRequired(true)),
  cooldown: 3,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const question = interaction.options.getString('question');
    const answer = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];

    await interaction.reply({
      embeds: [
        embed.game('🎱 Magic 8-Ball', '')
          .setDescription(null)
          .addFields(
            { name: '❓ Question', value: question },
            { name: '🎱 Answer', value: answer }
          ),
      ],
    });
  },
};
