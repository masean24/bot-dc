const axios = require('axios');
const NodeCache = require('node-cache');
const { ROBLOX_CACHE_TTL } = require('../config/constants');

const cache = new NodeCache({ stdTTL: ROBLOX_CACHE_TTL, checkperiod: 30 });

/**
 * Resolve a Roblox username to a userId.
 * @param {string} username - Roblox username
 * @returns {Promise<{id: string, name: string}|null>} User data or null if not found
 */
async function getUserIdFromUsername(username) {
  const cacheKey = `username:${username.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.post('https://users.roblox.com/v1/usernames/users', {
      usernames: [username],
      excludeBannedUsers: false,
    });

    if (!data.data || data.data.length === 0) return null;

    const user = { id: String(data.data[0].id), name: data.data[0].name };
    cache.set(cacheKey, user);
    return user;
  } catch {
    return null;
  }
}

/**
 * Fetch a Roblox user's profile (includes bio/description).
 * @param {string} userId - Roblox user ID
 * @returns {Promise<object|null>} User profile object or null
 */
async function getUserProfile(userId) {
  const cacheKey = `profile:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
    cache.set(cacheKey, data);
    return data;
  } catch {
    return null;
  }
}

/**
 * Fetch a user's group roles.
 * @param {string} userId - Roblox user ID
 * @returns {Promise<Array>} Array of group role objects
 */
async function getUserGroupRoles(userId) {
  const cacheKey = `groups:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`https://groups.roblox.com/v2/users/${userId}/groups/roles`);
    const roles = data.data || [];
    cache.set(cacheKey, roles);
    return roles;
  } catch {
    return [];
  }
}

/**
 * Get the rank of a user within a specific group.
 * @param {string} userId - Roblox user ID
 * @param {string} groupId - Roblox group ID
 * @returns {Promise<{rank: number, roleName: string}|null>} Rank info or null if not in group
 */
async function getUserGroupRank(userId, groupId) {
  const roles = await getUserGroupRoles(userId);
  const entry = roles.find((r) => String(r.group.id) === String(groupId));
  if (!entry) return null;
  return { rank: entry.role.rank, roleName: entry.role.name };
}

/**
 * Convert a placeId to a universeId.
 * @param {string} placeId - Roblox place ID
 * @returns {Promise<string|null>} Universe ID or null
 */
async function getUniverseIdFromPlaceId(placeId) {
  const cacheKey = `universe:${placeId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(
      `https://apis.roblox.com/universes/v1/places/${placeId}/universe`
    );
    const universeId = String(data.universeId);
    cache.set(cacheKey, universeId);
    return universeId;
  } catch {
    return null;
  }
}

/**
 * Fetch game info by universeId.
 * @param {string} universeId - Roblox universe ID
 * @returns {Promise<object|null>} Game info object or null
 */
async function getGameInfo(universeId) {
  const cacheKey = `game:${universeId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(
      `https://games.roblox.com/v1/games?universeIds=${universeId}`
    );
    if (!data.data || data.data.length === 0) return null;

    const game = data.data[0];
    cache.set(cacheKey, game);
    return game;
  } catch {
    return null;
  }
}

/**
 * Fetch full game info from a placeId (converts to universeId first).
 * @param {string} placeId - Roblox place ID
 * @returns {Promise<object|null>} Game info or null
 */
async function getGameInfoFromPlaceId(placeId) {
  const universeId = await getUniverseIdFromPlaceId(placeId);
  if (!universeId) return null;
  return getGameInfo(universeId);
}

module.exports = {
  getUserIdFromUsername,
  getUserProfile,
  getUserGroupRoles,
  getUserGroupRank,
  getUniverseIdFromPlaceId,
  getGameInfo,
  getGameInfoFromPlaceId,
};
