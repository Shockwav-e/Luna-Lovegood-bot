const { REST } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const chalk = require("chalk");
const { Token } = process.env.TOKEN || require("./config/config.json");
const { clientId } = process.env.CLIENT_ID || require("./config/config.json");
const commands = [];
const commandsPath = path.join(__dirname, "commands");

// Function to recursively load commands from all folders
const loadCommands = (dir) => {
  const commandFiles = fs.readdirSync(dir);
  for (const file of commandFiles) {
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      loadCommands(filePath); // Recursively load commands from subfolders
    } else if (file.endsWith(".js")) {
      const command = require(filePath);
      commands.push(command.data.toJSON());
    }
  }
};

// Load commands from all folders within the commands directory
loadCommands(commandsPath);

const rest = new REST({ version: "10" }).setToken(Token);

(async () => {
  try {
    console.log(chalk.blue("Started refreshing application (/) commands."));

    await rest.put(
      `/applications/${clientId}/commands`, // Make sure CLIENT_ID is defined
      { body: commands }
    );

    console.log(chalk.green("Successfully reloaded application (/) commands."));
  } catch (error) {
    console.error(chalk.red("Failed to reload application (/) commands:"));
    console.error(chalk.red(error));
  }
})();
