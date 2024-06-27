const { SlashCommandBuilder } = require("discord.js");
const chalk = require("chalk");
const refreshSlash = require("../../../Updator/slashcommand.js"); // Verify path
const restartbot = require("../../../Updator/restartbot.js"); // Verify path
const { ownerId } = require("../../../config/config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Refreshes the bot")
    .addStringOption((option) =>
      option
        .setName("choose")
        .setDescription("Choose what you want to refresh")
        .setRequired(true)
        .addChoices(
          { name: "Slash Commands", value: "slash" },
          { name: "Bot", value: "bot" }
        )
    ),
  async execute(interaction) {
    if (interaction.user.id !== ownerId) {
      await interaction.reply({
        content: `Only the bot owner can use this command.`,
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.reply({ content: "Refreshing...", ephemeral: true });

      const choice = interaction.options.getString("choose");

      if (choice === "slash") {
        await refreshSlash();

        await interaction.editReply({ content: "Slash Commands refreshed!" });
      }

      if (choice === "bot") {
        await interaction.editReply({ content: "Bot restarting started" });
        await restartbot();
      }
    } catch (error) {
      console.error(
        "An error occurred while executing the refresh command:",
        error
      );
      await interaction.reply({
        content: "An error occurred while processing the command.",
        ephemeral: true,
      });
    }
  },
};
