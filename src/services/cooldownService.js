const { DEFAULT_COOLDOWN } = require('../config/constants');

/**
 * In-memory cooldown store.
 * Key format: `${userId}-${commandName}-${guildId}`
 * Value: expiry timestamp (ms)
 * @type {Map<string, number>}
 */
const cooldowns = new Map();

/**
 * Check if a user is on cooldown for a command in a guild.
 * @param {string} userId - Discord user ID
 * @param {string} commandName - Command name
 * @param {string} guildId - Guild ID
 * @param {number} [cooldownSeconds] - Cooldown duration in seconds
 * @returns {{ onCooldown: boolean, remaining: number }} Cooldown status and time remaining in seconds
 */
function checkCooldown(userId, commandName, guildId, cooldownSeconds) {
  const duration = (cooldownSeconds ?? DEFAULT_COOLDOWN) * 1000;
  const key = `${userId}-${commandName}-${guildId}`;
  const now = Date.now();
  const expiry = cooldowns.get(key);

  if (expiry && now < expiry) {
    const remaining = Math.ceil((expiry - now) / 1000);
    return { onCooldown: true, remaining };
  }

  cooldowns.set(key, now + duration);
  return { onCooldown: false, remaining: 0 };
}

/**
 * Reset a user's cooldown for a command (e.g. on error).
 * @param {string} userId - Discord user ID
 * @param {string} commandName - Command name
 * @param {string} guildId - Guild ID
 */
function resetCooldown(userId, commandName, guildId) {
  const key = `${userId}-${commandName}-${guildId}`;
  cooldowns.delete(key);
}

/**
 * Periodically clean expired cooldowns to prevent memory leaks.
 */
function cleanupCooldowns() {
  const now = Date.now();
  for (const [key, expiry] of cooldowns) {
    if (now >= expiry) cooldowns.delete(key);
  }
}

// Cleanup every 5 minutes
setInterval(cleanupCooldowns, 5 * 60 * 1000).unref();

module.exports = { checkCooldown, resetCooldown };
