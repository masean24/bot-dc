const { Schema, model } = require('mongoose');

/**
 * Job schema for economy system. Each guild can have multiple jobs.
 */
const jobSchema = new Schema({
  guildId: { type: String, required: true },
  name: { type: String, required: true },
  minReward: { type: Number, default: 50 },
  maxReward: { type: Number, default: 200 },
  fireRate: { type: Number, default: 5 },
});

jobSchema.index({ guildId: 1, name: 1 }, { unique: true });

module.exports = model('Job', jobSchema);
