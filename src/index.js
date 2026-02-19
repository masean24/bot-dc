require('dotenv').config();

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const mongoose = require('mongoose');
const path = require('node:path');
const fs = require('node:fs');
const { loadCommands } = require('./utils/commandLoader');
const logger = require('./services/loggerService');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

/** Load all commands into client.commands collection */
const commandsPath = path.join(__dirname, 'commands');
client.commands = loadCommands(commandsPath);
logger.info('Bot', `Loaded ${client.commands.size} commands`);

/** Load all event handlers */
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((f) => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  logger.info('Bot', `Registered event: ${event.name}`);
}

/** Connect to MongoDB then login to Discord */
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Database', 'Connected to MongoDB');

    await client.login(process.env.DISCORD_TOKEN);
  } catch (err) {
    logger.error('Bot', `Startup failed: ${err.message}`);
    process.exit(1);
  }
})();

/** Graceful shutdown */
process.on('SIGINT', async () => {
  logger.info('Bot', 'Shutting down...');
  await mongoose.disconnect();
  client.destroy();
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  logger.error('Process', `Unhandled rejection: ${err?.message || err}`);
});
