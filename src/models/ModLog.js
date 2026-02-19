const { Schema, model } = require('mongoose');

/**
 * Moderation log schema for tracking all mod actions.
 */
const modLogSchema = new Schema({
  guildId: { type: String, required: true },
  targetId: { type: String, required: true },
  moderatorId: { type: String, required: true },
  action: { type: String, enum: ['ban', 'unban', 'kick', 'mute', 'unmute', 'warn'], required: true },
  reason: { type: String, default: 'No reason provided' },
  duration: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

modLogSchema.index({ guildId: 1, targetId: 1 });

module.exports = model('ModLog', modLogSchema);
