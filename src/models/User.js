const { Schema, model } = require('mongoose');

/**
 * User schema for storing Roblox verification data per guild.
 * Compound unique index on [discordId, guildId] ensures one record per user per guild.
 */
const userSchema = new Schema({
  discordId: { type: String, required: true },
  guildId: { type: String, required: true },
  robloxUserId: { type: String, default: null },
  robloxUsername: { type: String, default: null },
  verified: { type: Boolean, default: false },
  verifiedAt: { type: Date, default: null },
});

userSchema.index({ discordId: 1, guildId: 1 }, { unique: true });

module.exports = model('User', userSchema);
