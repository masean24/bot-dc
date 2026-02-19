const { Schema, model } = require('mongoose');

/**
 * Analytics schema for tracking per-user, per-guild message counts.
 * Compound unique index on [discordId, guildId].
 */
const analyticsSchema = new Schema({
  discordId: { type: String, required: true },
  guildId: { type: String, required: true },
  messageCount: { type: Number, default: 0 },
});

analyticsSchema.index({ discordId: 1, guildId: 1 }, { unique: true });

module.exports = model('Analytics', analyticsSchema);
