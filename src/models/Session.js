const { Schema, model } = require('mongoose');

/**
 * Session schema for training/event sessions.
 */
const sessionSchema = new Schema({
  guildId: { type: String, required: true },
  name: { type: String, required: true },
  hostId: { type: String, required: true },
  type: { type: String, default: 'Training' },
  status: { type: String, enum: ['scheduled', 'active', 'ended'], default: 'scheduled' },
  channelId: { type: String, default: null },
  messageId: { type: String, default: null },
  notes: { type: String, default: '' },
  startedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

sessionSchema.index({ guildId: 1 });

module.exports = model('Session', sessionSchema);
