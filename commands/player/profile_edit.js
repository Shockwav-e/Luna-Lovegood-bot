const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile_edit")
    .setDescription("Edit your profile information for Modern Warships Game.")
    .addStringOption((option) =>
      option
        .setName("ingame_name")
        .setDescription("Your new Game Name")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("ingame_id")
        .setDescription("Your new Game ID")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Your new Game Title")
        .setRequired(false)
        .addChoices(
          { name: "Hero", value: "Hero" },
          { name: "Legendary", value: "Legendary" },
          { name: "None", value: "None" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("profile_screenshot_url")
        .setDescription("Updated Profile Screenshot URL")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("about")
        .setDescription("Updated About Me")
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const user = interaction.user;
      const newName = interaction.options.getString("ingame_name");
      const newId = interaction.options.getString("ingame_id");
      const newTitle = interaction.options.getString("title");
      const newScreenshot = interaction.options.getString(
        "profile_screenshot_url"
      );
      const newAbout = interaction.options.getString("about");

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
        return await interaction.editReply(
          "No profile found to edit. Please create a profile first."
        );
      }

      // Read and update the profile data
      const profileData = JSON.parse(fs.readFileSync(profilePath, "utf-8"));

      if (newName) profileData.ingameName = newName;
      if (newId) profileData.ingameId = newId;
      if (newTitle) profileData.title = newTitle;
      if (newScreenshot) profileData.screenshotUrl = newScreenshot;

      if (newAbout) profileData.about = newAbout;

      profileData.timestamp = new Date().toISOString();

      // Write the updated profile data back to the file
      fs.writeFileSync(profilePath, JSON.stringify(profileData, null, 2));

      const embed = new EmbedBuilder()
        .setAuthor({
          name: user.globalName || user.username,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setTitle("Profile Updated")
        .setDescription(`Profile updated for <@${user.id}>`)
        .addFields(
          { name: "In-Game Name", value: profileData.ingameName, inline: true },
          { name: "In-Game ID", value: profileData.ingameId, inline: true },
          { name: "Title", value: profileData.title, inline: true },
          {
            name: "Screenshot",
            value: `[Click Here]({profileData.screenshotUrl})`,
            inline: true,
          },
          {
            name: "About",
            value: profileData.about || "No information provided",
            inline: false,
          }
        )
        .setImage(profileData.screenshotUrl)
        .setColor("Gold")
        .setTimestamp()
        .setFooter({
          text: `Updated by ${user.username}`,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(
        chalk.red(
          "An error occurred while executing the profile edit command:"
        ),
        chalk.red(error)
      );
      await interaction.editReply(
        "An error occurred while editing your profile. Please try again later."
      );
    }
  },
};
