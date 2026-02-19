const noblox = require('noblox.js');
const NodeCache = require('node-cache');
const logger = require('./loggerService');

const cache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

/** @type {Map<string, boolean>} Track which guild cookies are currently logged in */
const loggedInGuilds = new Map();

/**
 * Login to Roblox with a cookie for a specific guild.
 * @param {string} cookie - .ROBLOSECURITY cookie
 * @param {string} guildId - Guild ID for tracking
 * @returns {Promise<boolean>} Whether login was successful
 */
async function loginWithCookie(cookie, guildId) {
  try {
    await noblox.setCookie(cookie);
    loggedInGuilds.set(guildId, true);
    logger.info('Noblox', `Logged in for guild ${guildId}`);
    return true;
  } catch (err) {
    logger.error('Noblox', `Login failed for guild ${guildId}: ${err.message}`);
    loggedInGuilds.set(guildId, false);
    return false;
  }
}

/**
 * Ensure we're logged in for a guild. Returns false if no cookie or login fails.
 * @param {string} cookie - .ROBLOSECURITY cookie
 * @param {string} guildId - Guild ID
 * @returns {Promise<boolean>}
 */
async function ensureLoggedIn(cookie, guildId) {
  if (!cookie) return false;
  if (loggedInGuilds.get(guildId)) return true;
  return loginWithCookie(cookie, guildId);
}

/**
 * Promote a user in a Roblox group.
 * @param {number} groupId - Roblox group ID
 * @param {number} userId - Roblox user ID
 * @returns {Promise<{oldRole: object, newRole: object}>}
 */
async function promoteUser(groupId, userId) {
  return noblox.promote(groupId, userId);
}

/**
 * Demote a user in a Roblox group.
 * @param {number} groupId - Roblox group ID
 * @param {number} userId - Roblox user ID
 * @returns {Promise<{oldRole: object, newRole: object}>}
 */
async function demoteUser(groupId, userId) {
  return noblox.demote(groupId, userId);
}

/**
 * Set a user's rank in a Roblox group.
 * @param {number} groupId - Roblox group ID
 * @param {number} userId - Roblox user ID
 * @param {number} rankId - Rank number (0-255)
 * @returns {Promise<{oldRole: object, newRole: object}>}
 */
async function setRank(groupId, userId, rankId) {
  return noblox.setRank(groupId, userId, rankId);
}

/**
 * Exile (fire) a user from a Roblox group.
 * @param {number} groupId - Roblox group ID
 * @param {number} userId - Roblox user ID
 * @returns {Promise<void>}
 */
async function exileUser(groupId, userId) {
  return noblox.exile(groupId, userId);
}

/**
 * Get group info.
 * @param {number} groupId - Roblox group ID
 * @returns {Promise<object>}
 */
async function getGroupInfo(groupId) {
  const cacheKey = `groupinfo:${groupId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const info = await noblox.getGroup(groupId);
  cache.set(cacheKey, info);
  return info;
}

/**
 * Post a group shout.
 * @param {number} groupId - Roblox group ID
 * @param {string} message - Shout message (empty string to clear)
 * @returns {Promise<object>}
 */
async function postShout(groupId, message) {
  return noblox.shout(groupId, message);
}

/**
 * Get pending join requests for a group.
 * @param {number} groupId - Roblox group ID
 * @returns {Promise<Array>}
 */
async function getJoinRequests(groupId) {
  return noblox.getJoinRequests(groupId);
}

/**
 * Accept a join request.
 * @param {number} groupId - Roblox group ID
 * @param {number} userId - Roblox user ID
 * @returns {Promise<void>}
 */
async function acceptJoinRequest(groupId, userId) {
  return noblox.handleJoinRequest(groupId, userId, true);
}

/**
 * Get group wall posts.
 * @param {number} groupId - Roblox group ID
 * @param {string} [sortOrder='Desc'] - Sort order
 * @param {number} [limit=100] - Limit
 * @returns {Promise<Array>}
 */
async function getWallPosts(groupId, sortOrder = 'Desc', limit = 100) {
  return noblox.getWall(groupId, sortOrder, limit);
}

/**
 * Delete a group wall post.
 * @param {number} groupId - Roblox group ID
 * @param {number} postId - Wall post ID
 * @returns {Promise<void>}
 */
async function deleteWallPost(groupId, postId) {
  return noblox.deleteWallPost(groupId, postId);
}

/**
 * Get the audit log for a group (for revert abuse).
 * @param {number} groupId - Roblox group ID
 * @param {string} [actionType='ChangeRank'] - Action type
 * @param {number} [limit=50] - Limit
 * @returns {Promise<Array>}
 */
async function getAuditLog(groupId, actionType = 'ChangeRank', limit = 50) {
  return noblox.getAuditLog(groupId, actionType, undefined, limit);
}

/**
 * Check if a user owns a gamepass.
 * @param {number} userId - Roblox user ID
 * @param {number} gamepassId - Gamepass ID
 * @returns {Promise<boolean>}
 */
async function userOwnsGamepass(userId, gamepassId) {
  const cacheKey = `gamepass:${userId}:${gamepassId}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const owns = await noblox.getOwnership(userId, gamepassId, 'GamePass');
    cache.set(cacheKey, owns);
    return owns;
  } catch {
    return false;
  }
}

/**
 * Get a user's rank in a specific group.
 * @param {number} groupId - Roblox group ID
 * @param {number} userId - Roblox user ID
 * @returns {Promise<{rank: number, name: string, id: number}>}
 */
async function getRankInGroup(groupId, userId) {
  const cacheKey = `rank:${groupId}:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const rank = await noblox.getRankInGroup(groupId, userId);
  const rankName = await noblox.getRankNameInGroup(groupId, userId);
  const result = { rank, name: rankName };
  cache.set(cacheKey, result);
  return result;
}

/**
 * Get all roles in a group.
 * @param {number} groupId - Roblox group ID
 * @returns {Promise<Array>}
 */
async function getGroupRoles(groupId) {
  const cacheKey = `roles:${groupId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const roles = await noblox.getRoles(groupId);
  cache.set(cacheKey, roles);
  return roles;
}

module.exports = {
  ensureLoggedIn,
  loginWithCookie,
  promoteUser,
  demoteUser,
  setRank,
  exileUser,
  getGroupInfo,
  postShout,
  getJoinRequests,
  acceptJoinRequest,
  getWallPosts,
  deleteWallPost,
  getAuditLog,
  userOwnsGamepass,
  getRankInGroup,
  getGroupRoles,
};
