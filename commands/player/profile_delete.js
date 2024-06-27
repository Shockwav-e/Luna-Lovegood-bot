const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile_delete")
    .setDescription("Delete your profile for Modern Warships Game."),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const user = interaction.user;
      const profilesFolder = path.join(
        __dirname,
        "..",
        "..",
        "database",
        "profiles"
      );

      // Check if profile exists
      const profileFile = `${user.id}_${user.username}.json`;
      const profilePath = path.join(profilesFolder, profileFile);

      if (!fs.existsSync(profilePath)) {
        return await interaction.editReply("No profile found to delete.");
      }

      // Delete the profile file
      fs.unlinkSync(profilePath);

      await interaction.editReply(
        "Your profile has been successfully deleted."
      );
    } catch (error) {
      console.error(
        chalk.red(
          "An error occurred while executing the profile delete command:"
        ),
        chalk.red(error)
      );
      await interaction.editReply(
        "An error occurred while deleting your profile. Please try again later."
      );
    }
  },
};
