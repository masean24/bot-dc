const { Schema, model } = require('mongoose');

/**
 * Ticket schema for support ticket system.
 */
const ticketSchema = new Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true, unique: true },
  creatorId: { type: String, required: true },
  users: [{ type: String }],
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
});

ticketSchema.index({ guildId: 1, creatorId: 1 });

module.exports = model('Ticket', ticketSchema);
