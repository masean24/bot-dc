const { Schema, model } = require('mongoose');

/**
 * Economy schema for per-user, per-guild wallet and bank balances.
 */
const economySchema = new Schema({
  discordId: { type: String, required: true },
  guildId: { type: String, required: true },
  wallet: { type: Number, default: 0 },
  bank: { type: Number, default: 0 },
  job: { type: String, default: null },
  lastWork: { type: Date, default: null },
  lastDaily: { type: Date, default: null },
});

economySchema.index({ discordId: 1, guildId: 1 }, { unique: true });

module.exports = model('Economy', economySchema);
