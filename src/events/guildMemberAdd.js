const Guild = require('../models/Guild');
const embed = require('../utils/embed');

module.exports = {
  name: 'guildMemberAdd',
  once: false,

  /**
   * Fired when a member joins a guild. Sends welcome message if configured.
   * @param {import('discord.js').GuildMember} member
   * @param {import('discord.js').Client} client
   */
  async execute(member, client) {
    try {
      const guildConfig = await Guild.findOne({ guildId: member.guild.id });
      if (!guildConfig?.welcome?.enabled || !guildConfig.welcome.channelId) return;

      const channel = await member.guild.channels.fetch(guildConfig.welcome.channelId).catch(() => null);
      if (!channel) return;

      const message = (guildConfig.welcome.message || 'Welcome, {user}!')
        .replace(/{user}/g, `${member}`)
        .replace(/{server}/g, member.guild.name)
        .replace(/{membercount}/g, member.guild.memberCount);

      await channel.send({
        embeds: [
          embed.success('👋 Welcome!', message)
            .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
            .setFooter({ text: `Member #${member.guild.memberCount}` }),
        ],
      });
    } catch {
      // Silently fail
    }
  },
};
