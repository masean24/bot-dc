const { Schema, model } = require('mongoose');

/**
 * Transaction schema for economy audit trail.
 */
const transactionSchema = new Schema({
  discordId: { type: String, required: true },
  guildId: { type: String, required: true },
  type: { type: String, enum: ['deposit', 'withdraw', 'work', 'transfer', 'admin_add', 'admin_remove'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

transactionSchema.index({ discordId: 1, guildId: 1 });
transactionSchema.index({ createdAt: 1 });

module.exports = model('Transaction', transactionSchema);
