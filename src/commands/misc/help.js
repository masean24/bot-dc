const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('See a list of all the commands'),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const commands = client.commands;
    const categories = {};

    commands.forEach((cmd) => {
      const category = cmd.category || 'Other';
      if (!categories[category]) categories[category] = [];
      categories[category].push(`\`/${cmd.data.name}\` — ${cmd.data.description}`);
    });

    const fields = Object.entries(categories).map(([cat, cmds]) => ({
      name: cat,
      value: cmds.join('\n'),
    }));

    // Build a simpler overview by folder structure
    const cmdList = commands.map((cmd) => `\`/${cmd.data.name}\``).sort();

    await interaction.reply({
      embeds: [
        embed.info('📖 Command List', `This bot has **${commands.size}** commands.\n\n${cmdList.join(', ')}`)
          .setFooter({ text: 'Use /info <category> for more details' }),
      ],
      ephemeral: true,
    });
  },
};
