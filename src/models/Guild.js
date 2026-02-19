const { Schema, model } = require('mongoose');

/**
 * Guild configuration schema.
 * Stores per-guild settings for welcome, verification, Roblox integration, logging, and AI.
 */
const guildSchema = new Schema(
  {
    guildId: { type: String, unique: true, required: true },
    welcome: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
      message: { type: String, default: 'Welcome to the server, {user}!' },
    },
    verification: {
      enabled: { type: Boolean, default: false },
      roleId: { type: String, default: null },
    },
    roblox: {
      verificationEnabled: { type: Boolean, default: false },
      groupId: { type: String, default: null },
      minimumRank: { type: Number, default: 0 },
      verifiedRoleId: { type: String, default: null },
    },
    logging: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
    },
    ai: {
      enabled: { type: Boolean, default: false },
      dailyLimit: { type: Number, default: 50 },
    },
  },
  { timestamps: true }
);

module.exports = model('Guild', guildSchema);
