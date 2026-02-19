const { Schema, model } = require('mongoose');

/**
 * Suggestion schema for community suggestions.
 */
const suggestionSchema = new Schema({
  guildId: { type: String, required: true },
  messageId: { type: String, default: null },
  channelId: { type: String, default: null },
  authorId: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

suggestionSchema.index({ guildId: 1 });

module.exports = model('Suggestion', suggestionSchema);
