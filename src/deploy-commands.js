require('dotenv').config();

const { REST, Routes } = require('discord.js');
const path = require('node:path');
const { loadCommands, getCommandData } = require('./utils/commandLoader');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const devGuildId = process.env.DEV_GUILD_ID;

if (!token || !clientId) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID in .env');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

/**
 * Register all slash commands globally or to a dev guild.
 */
(async () => {
  try {
    const commandsPath = path.join(__dirname, 'commands');
    const commands = loadCommands(commandsPath);
    const commandData = getCommandData(commands);

    console.log(`Registering ${commandData.length} commands...`);

    if (devGuildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, devGuildId), {
        body: commandData,
      });
      console.log(`Successfully registered ${commandData.length} guild commands to ${devGuildId}`);
    } else {
      await rest.put(Routes.applicationCommands(clientId), {
        body: commandData,
      });
      console.log(`Successfully registered ${commandData.length} global commands`);
    }
  } catch (err) {
    console.error('Failed to register commands:', err);
    process.exit(1);
  }
})();
