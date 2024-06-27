const fs = require("fs");
const chalk = require("chalk");
const path = require("path");
const { Token } = process.env.TOKEN || require("./config/config.json");
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  Interaction,
} = require("discord.js");
require("dotenv").config(); // Load environment variables from .env

// Initialize the client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.commands = new Collection();
const cooldowns = new Collection();

// Load command files
const loadCommands = (dir) => {
  const commandFiles = fs.readdirSync(dir);
  for (const file of commandFiles) {
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      loadCommands(filePath); // Recursively load commands from subfolders
    } else if (file.endsWith(".js")) {
      const command = require(filePath);
      client.commands.set(command.data.name, command);
    }
  }
};

// Load commands from all folders within the commands directory
const commandsPath = path.join(__dirname, "commands");
loadCommands(commandsPath);

// Load event files
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);

  if ("name" in event && "execute" in event) {
    client.on(event.name, (...args) => event.execute(...args, client));
    console.log(
      chalk.cyanBright("Loaded event: ") + chalk.greenBright(event.name)
    );
    // Log loaded events
  } else {
    console.warn(
      chalk.redBright(
        `Event file ${file} is missing "name" or "execute" property.`
      )
    );
  }
}
// Log in the client
client.login(Token).catch((error) => {
  console.error(chalk.redBright(`Failed to login: ${error.message}`));
});

process.on("unhandledRejection", (error) => {
  console.error(chalk.redBright("Unhandled promise rejection:", error));
});
