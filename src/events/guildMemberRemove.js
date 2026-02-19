const Guild = require('../models/Guild');
const embed = require('../utils/embed');

module.exports = {
  name: 'guildMemberRemove',
  once: false,

  /**
   * Fired when a member leaves a guild. Sends leave message if configured.
   * @param {import('discord.js').GuildMember} member
   * @param {import('discord.js').Client} client
   */
  async execute(member, client) {
    try {
      const guildConfig = await Guild.findOne({ guildId: member.guild.id });
      if (!guildConfig?.leave?.enabled || !guildConfig.leave.channelId) return;

      const channel = await member.guild.channels.fetch(guildConfig.leave.channelId).catch(() => null);
      if (!channel) return;

      const message = (guildConfig.leave.message || '{user} has left the server.')
        .replace(/{user}/g, member.user.tag)
        .replace(/{server}/g, member.guild.name)
        .replace(/{membercount}/g, member.guild.memberCount);

      await channel.send({
        embeds: [
          embed.error('👋 Goodbye', message)
            .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
            .setFooter({ text: `${member.guild.memberCount} members remaining` }),
        ],
      });
    } catch {
      // Silently fail
    }
  },
};
