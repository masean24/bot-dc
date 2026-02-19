const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embed = require('../../utils/embed');
const Guild = require('../../models/Guild');
const Ticket = require('../../models/Ticket');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket system')
    .addSubcommand((sub) =>
      sub
        .setName('create')
        .setDescription('Create a ticket for someone')
        .addUserOption((opt) => opt.setName('user').setDescription('User to create ticket for (defaults to you)'))
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason for the ticket'))
    )
    .addSubcommand((sub) =>
      sub
        .setName('adduser')
        .setDescription('Add someone to the ticket')
        .addUserOption((opt) => opt.setName('user').setDescription('User to add').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('removeuser')
        .setDescription('Remove someone from the ticket')
        .addUserOption((opt) => opt.setName('user').setDescription('User to remove').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('forceclose')
        .setDescription('For close a ticket using a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    ),
  cooldown: 5,

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ embeds: [embed.error('Error', 'Server only.')], ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'create') {
      await interaction.deferReply({ ephemeral: true });

      const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
      const categoryId = guildConfig?.tickets?.categoryId || null;

      const targetUser = interaction.options.getUser('user') || interaction.user;
      const reason = interaction.options.getString('reason') || 'No reason provided';

      const existingTicket = await Ticket.findOne({
        guildId: interaction.guild.id,
        creatorId: targetUser.id,
        status: 'open',
      });

      if (existingTicket) {
        return interaction.editReply({ embeds: [embed.warn('Ticket Exists', `${targetUser.tag} already has an open ticket: <#${existingTicket.channelId}>`)] });
      }

      try {
        const channelOptions = {
          name: `ticket-${targetUser.username}`,
          type: ChannelType.GuildText,
          permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: targetUser.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
            { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] },
          ],
        };

        if (categoryId) channelOptions.parent = categoryId;

        const channel = await interaction.guild.channels.create(channelOptions);

        await Ticket.create({
          guildId: interaction.guild.id,
          channelId: channel.id,
          creatorId: targetUser.id,
          users: [targetUser.id],
        });

        const closeRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('ticket_close')
            .setLabel('Close Ticket')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒')
        );

        await channel.send({
          embeds: [
            embed.info('🎫 Ticket Created', `**Created by:** ${interaction.user}\n**For:** ${targetUser}\n**Reason:** ${reason}`)
              .setFooter({ text: 'Click the button below to close this ticket' }),
          ],
          components: [closeRow],
        });

        await interaction.editReply({ embeds: [embed.success('✅ Ticket Created', `Ticket created: ${channel}`)] });
      } catch (err) {
        await interaction.editReply({ embeds: [embed.error('Error', `Failed to create ticket: ${err.message}`)] });
      }
    }

    if (sub === 'adduser') {
      const user = interaction.options.getUser('user');

      const ticket = await Ticket.findOne({ guildId: interaction.guild.id, channelId: interaction.channel.id, status: 'open' });
      if (!ticket) {
        return interaction.reply({ embeds: [embed.error('Error', 'This command can only be used inside a ticket channel.')], ephemeral: true });
      }

      try {
        await interaction.channel.permissionOverwrites.edit(user.id, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true,
        });

        if (!ticket.users.includes(user.id)) {
          ticket.users.push(user.id);
          await ticket.save();
        }

        await interaction.reply({ embeds: [embed.success('✅ User Added', `${user} has been added to this ticket.`)] });
      } catch (err) {
        await interaction.reply({ embeds: [embed.error('Error', err.message)], ephemeral: true });
      }
    }

    if (sub === 'removeuser') {
      const user = interaction.options.getUser('user');

      const ticket = await Ticket.findOne({ guildId: interaction.guild.id, channelId: interaction.channel.id, status: 'open' });
      if (!ticket) {
        return interaction.reply({ embeds: [embed.error('Error', 'This command can only be used inside a ticket channel.')], ephemeral: true });
      }

      try {
        await interaction.channel.permissionOverwrites.delete(user.id);
        ticket.users = ticket.users.filter((id) => id !== user.id);
        await ticket.save();

        await interaction.reply({ embeds: [embed.success('✅ User Removed', `${user} has been removed from this ticket.`)] });
      } catch (err) {
        await interaction.reply({ embeds: [embed.error('Error', err.message)], ephemeral: true });
      }
    }

    if (sub === 'forceclose') {
      const ticket = await Ticket.findOne({ guildId: interaction.guild.id, channelId: interaction.channel.id, status: 'open' });
      if (!ticket) {
        return interaction.reply({ embeds: [embed.error('Error', 'This is not an open ticket channel.')], ephemeral: true });
      }

      await interaction.reply({ embeds: [embed.warn('🔒 Ticket Closing', 'This ticket will be deleted in 5 seconds...')] });

      ticket.status = 'closed';
      await ticket.save();

      setTimeout(async () => {
        try {
          await interaction.channel.delete();
        } catch {
          // Channel may already be deleted
        }
      }, 5000);
    }
  },
};
