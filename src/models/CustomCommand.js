const { Schema, model } = require('mongoose');

/**
 * Custom command schema for user-defined commands per guild.
 */
const customCommandSchema = new Schema({
  guildId: { type: String, required: true },
  name: { type: String, required: true },
  response: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

customCommandSchema.index({ guildId: 1, name: 1 }, { unique: true });

module.exports = model('CustomCommand', customCommandSchema);
