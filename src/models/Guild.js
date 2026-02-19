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
    leave: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
      message: { type: String, default: '{user} has left the server.' },
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
      cookie: { type: String, default: null },
    },
    logging: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
    },
    moderation: {
      logChannelId: { type: String, default: null },
      dmLogChannelId: { type: String, default: null },
      muteRoleId: { type: String, default: null },
    },
    economy: {
      enabled: { type: Boolean, default: false },
      currencyName: { type: String, default: 'coins' },
      startingBalance: { type: Number, default: 0 },
      workCooldown: { type: Number, default: 60 },
    },
    tickets: {
      enabled: { type: Boolean, default: false },
      categoryId: { type: String, default: null },
      logChannelId: { type: String, default: null },
    },
    sessions: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
    },
    suggestions: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
    },
    activityTracker: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
    },
    customStatus: { type: String, default: null },
    embedColor: { type: String, default: null },
    ai: {
      enabled: { type: Boolean, default: false },
      dailyLimit: { type: Number, default: 50 },
    },
  },
  { timestamps: true }
);

module.exports = model('Guild', guildSchema);
