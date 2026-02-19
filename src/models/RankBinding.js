const { Schema, model } = require('mongoose');

/**
 * Rank binding schema — maps Roblox group ranks to Discord roles.
 */
const rankBindingSchema = new Schema({
  guildId: { type: String, required: true },
  groupId: { type: String, required: true },
  robloxRankId: { type: Number, required: true },
  robloxRankName: { type: String, default: '' },
  discordRoleId: { type: String, required: true },
});

rankBindingSchema.index({ guildId: 1, groupId: 1, robloxRankId: 1 }, { unique: true });

module.exports = model('RankBinding', rankBindingSchema);
