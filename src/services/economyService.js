const Economy = require('../models/Economy');
const Transaction = require('../models/Transaction');

/**
 * Get or create an economy profile for a user in a guild.
 * @param {string} discordId - Discord user ID
 * @param {string} guildId - Guild ID
 * @param {number} [startingBalance=0] - Starting wallet balance
 * @returns {Promise<object>} Economy document
 */
async function getProfile(discordId, guildId, startingBalance = 0) {
  let profile = await Economy.findOne({ discordId, guildId });
  if (!profile) {
    profile = await Economy.create({ discordId, guildId, wallet: startingBalance });
  }
  return profile;
}

/**
 * Add money to a user's wallet.
 * @param {string} discordId
 * @param {string} guildId
 * @param {number} amount
 * @param {string} type - Transaction type
 * @param {string} description
 * @returns {Promise<object>} Updated economy document
 */
async function addToWallet(discordId, guildId, amount, type, description) {
  const profile = await Economy.findOneAndUpdate(
    { discordId, guildId },
    { $inc: { wallet: amount } },
    { upsert: true, new: true }
  );
  await Transaction.create({ discordId, guildId, type, amount, description });
  return profile;
}

/**
 * Remove money from a user's wallet.
 * @param {string} discordId
 * @param {string} guildId
 * @param {number} amount
 * @param {string} type
 * @param {string} description
 * @returns {Promise<object|null>} Updated doc or null if insufficient funds
 */
async function removeFromWallet(discordId, guildId, amount, type, description) {
  const profile = await Economy.findOne({ discordId, guildId });
  if (!profile || profile.wallet < amount) return null;
  profile.wallet -= amount;
  await profile.save();
  await Transaction.create({ discordId, guildId, type, amount: -amount, description });
  return profile;
}

/**
 * Deposit money from wallet to bank.
 * @param {string} discordId
 * @param {string} guildId
 * @param {number} amount
 * @returns {Promise<object|null>} Updated doc or null if insufficient
 */
async function deposit(discordId, guildId, amount) {
  const profile = await Economy.findOne({ discordId, guildId });
  if (!profile || profile.wallet < amount) return null;
  profile.wallet -= amount;
  profile.bank += amount;
  await profile.save();
  await Transaction.create({ discordId, guildId, type: 'deposit', amount, description: 'Deposit to bank' });
  return profile;
}

/**
 * Withdraw money from bank to wallet.
 * @param {string} discordId
 * @param {string} guildId
 * @param {number} amount
 * @returns {Promise<object|null>} Updated doc or null if insufficient
 */
async function withdraw(discordId, guildId, amount) {
  const profile = await Economy.findOne({ discordId, guildId });
  if (!profile || profile.bank < amount) return null;
  profile.bank -= amount;
  profile.wallet += amount;
  await profile.save();
  await Transaction.create({ discordId, guildId, type: 'withdraw', amount, description: 'Withdraw from bank' });
  return profile;
}

/**
 * Get the top balances in a guild.
 * @param {string} guildId
 * @param {number} [limit=10]
 * @returns {Promise<Array>}
 */
async function getLeaderboard(guildId, limit = 10) {
  return Economy.aggregate([
    { $match: { guildId } },
    { $addFields: { total: { $add: ['$wallet', '$bank'] } } },
    { $sort: { total: -1 } },
    { $limit: limit },
  ]);
}

/**
 * Get recent transactions for a user.
 * @param {string} discordId
 * @param {string} guildId
 * @param {number} [limit=10]
 * @returns {Promise<Array>}
 */
async function getTransactions(discordId, guildId, limit = 10) {
  return Transaction.find({ discordId, guildId }).sort({ createdAt: -1 }).limit(limit).lean();
}

module.exports = {
  getProfile,
  addToWallet,
  removeFromWallet,
  deposit,
  withdraw,
  getLeaderboard,
  getTransactions,
};
