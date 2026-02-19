const { Schema, model } = require('mongoose');

/**
 * Quiz score schema for tracking Roblox trivia performance per user per guild.
 * Compound unique index on [discordId, guildId].
 */
const quizScoreSchema = new Schema({
  discordId: { type: String, required: true },
  guildId: { type: String, required: true },
  score: { type: Number, default: 0 },
  totalAttempts: { type: Number, default: 0 },
});

quizScoreSchema.index({ discordId: 1, guildId: 1 }, { unique: true });

module.exports = model('QuizScore', quizScoreSchema);
