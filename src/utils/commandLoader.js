const fs = require('node:fs');
const path = require('node:path');
const { Collection } = require('discord.js');

/**
 * Recursively load all command files from the commands directory.
 * Each command file must export { data, execute } at minimum.
 * @param {string} commandsDir - Absolute path to the commands directory
 * @returns {Collection<string, object>} Collection of commands keyed by command name
 */
function loadCommands(commandsDir) {
  const commands = new Collection();

  /**
   * Recursively read directory and load .js command files.
   * @param {string} dir - Directory to scan
   */
  function readDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        readDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        try {
          const command = require(fullPath);
          if (command.data && command.execute) {
            commands.set(command.data.name, command);
          } else {
            console.warn(`[CommandLoader] Skipping ${fullPath}: missing "data" or "execute" export.`);
          }
        } catch (err) {
          console.error(`[CommandLoader] Failed to load ${fullPath}:`, err.message);
        }
      }
    }
  }

  readDir(commandsDir);
  return commands;
}

/**
 * Collect all command JSON data for registration.
 * @param {Collection<string, object>} commands - Loaded commands collection
 * @returns {object[]} Array of command JSON objects for REST registration
 */
function getCommandData(commands) {
  return commands.map((cmd) => cmd.data.toJSON());
}

module.exports = { loadCommands, getCommandData };
