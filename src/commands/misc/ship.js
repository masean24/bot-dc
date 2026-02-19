const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ship')
    .setDescription('Ship someone with another human being... or robot')
    .addUserOption((opt) => opt.setName('user1').setDescription('First person').setRequired(true))
    .addUserOption((opt) => opt.setName('user2').setDescription('Second person').setRequired(true)),
  cooldown: 3,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const user1 = interaction.options.getUser('user1');
    const user2 = interaction.options.getUser('user2');
    const percentage = Math.floor(Math.random() * 101);

    let meter = '';
    const filled = Math.round(percentage / 10);
    for (let i = 0; i < 10; i++) {
      meter += i < filled ? '❤️' : '🖤';
    }

    let comment;
    if (percentage >= 90) comment = 'Perfect match! 💕';
    else if (percentage >= 70) comment = 'Great couple! 💖';
    else if (percentage >= 50) comment = 'There\'s something there... 💗';
    else if (percentage >= 30) comment = 'Maybe just friends? 💛';
    else if (percentage >= 10) comment = 'Not looking great... 💔';
    else comment = 'Absolutely not. 🚫';

    await interaction.reply({
      embeds: [
        embed.game('💘 Ship', '')
          .setDescription(`${user1} x ${user2}`)
          .addFields(
            { name: 'Compatibility', value: `**${percentage}%**\n${meter}` },
            { name: 'Verdict', value: comment }
          ),
      ],
    });
  },
};
