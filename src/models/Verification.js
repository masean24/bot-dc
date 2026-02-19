const { Schema, model } = require('mongoose');

/**
 * Pending verification schema.
 * Documents auto-expire after 10 minutes via TTL index on expiresAt.
 */
const verificationSchema = new Schema({
  discordId: { type: String, required: true },
  guildId: { type: String, required: true },
  robloxUserId: { type: String, required: true },
  robloxUsername: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
verificationSchema.index({ discordId: 1, guildId: 1 });

module.exports = model('Verification', verificationSchema);
