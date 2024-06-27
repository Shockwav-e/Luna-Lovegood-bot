const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { ownerId } = require("../../../config/config.json");

// Cooldown map
const cooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reloads a command.")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command to reload.")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Check cooldown
    const cooldownAmount = 10 * 1000; // 10 seconds
    if (cooldowns.has(interaction.user.id)) {
      const expirationTime =
        cooldowns.get(interaction.user.id) + cooldownAmount;
      if (Date.now() < expirationTime) {
        const timeLeft = (expirationTime - Date.now()) / 1000;
        return interaction.reply({
          content: `Please wait ${timeLeft.toFixed(
            1
          )} more seconds before reusing the \`reload\` command.`,
          ephemeral: true,
        });
      }
    }
    cooldowns.set(interaction.user.id, Date.now());

    if (!ownerId) {
      console.error("ownerId is not set in the config file.");
      return interaction.reply({
        content:
          "There was an error while executing this command. Owner ID is not configured.",
        ephemeral: true,
      });
    }

    if (interaction.user.id !== ownerId) {
      return interaction.reply({
        content: "Only the bot owner can use this command.",
        ephemeral: true,
      });
    }

    const commandName = interaction.options
      .getString("command", true)
      .toLowerCase();

    // Basic validation to prevent directory traversal
    if (commandName.includes("/") || commandName.includes("\\")) {
      return interaction.reply({
        content: "Invalid command name.",
        ephemeral: true,
      });
    }

    const command = interaction.client.commands.get(commandName);

    if (!command) {
      return interaction.reply({
        content: `There is no command with name \`${commandName}\`!`,
        ephemeral: true,
      });
    }

    const commandsPath = path.resolve(__dirname, "../../../commands");

    try {
      // Use the command's path from the loaded command, if available
      const commandPath =
        command.filepath || findCommandFile(commandsPath, `${commandName}.js`);

      if (!commandPath) {
        return interaction.reply({
          content: `Could not find the command file for \`${commandName}\`!`,
          ephemeral: true,
        });
      }

      delete require.cache[require.resolve(commandPath)];
      const newCommand = require(commandPath);
      newCommand.filepath = commandPath; // Store the filepath for future reloads

      interaction.client.commands.set(newCommand.data.name, newCommand);

      // Update aliases if any
      if (newCommand.aliases) {
        newCommand.aliases.forEach((alias) => {
          interaction.client.commands.set(alias, newCommand);
        });
      }

      console.log(
        `Command ${newCommand.data.name} was reloaded by ${interaction.user.tag}.`
      );
      await interaction.reply({
        content: `Command \`${newCommand.data.name}\` was reloaded!`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `There was an error while reloading the command \`${commandName}\`:\n\`${error.message}\``,
        ephemeral: true,
      });
    }
  },
};

// Improved findCommandFile function
function findCommandFile(directory, filename) {
  const files = fs.readdirSync(directory, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      const filepath = findCommandFile(
        path.join(directory, file.name),
        filename
      );
      if (filepath) return filepath;
    } else if (file.name === filename) {
      return path.join(directory, file.name);
    }
  }

  return null;
}
