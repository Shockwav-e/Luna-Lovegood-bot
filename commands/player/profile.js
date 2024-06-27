const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

// Define the path to the storage directory
const storagePath = path.join(__dirname, "..", "..", "database", "profiles");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Get information about the user")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to get information about")
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const target = interaction.options.getUser("target") || interaction.user;

      // Check if the storage directory exists
      if (!fs.existsSync(storagePath)) {
        return await interaction.editReply(
          "Profile storage directory not found."
        );
      }

      // Find the profile file for the target user
      const profileFile = `${target.id}_${target.username}.json`;
      const profilePath = path.join(storagePath, profileFile);

      // Check if the profile file exists
      if (!fs.existsSync(profilePath)) {
        return await interaction.editReply(
          `Profile not found for ${target.username}.`
        );
      }

      // Read and parse the profile JSON file
      const profileData = JSON.parse(fs.readFileSync(profilePath, "utf8"));

      // Create an embed with the user's profile data
      const embed = new EmbedBuilder()
        .setAuthor({
          name: target.globalName || target.username,
          iconURL: target.displayAvatarURL({ dynamic: true }),
        })
        .setColor("Gold")
        .setTitle(`${profileData.ingameName}'s Profile`)
        .setDescription(`Discord: <@${profileData.userId}>`)
        .addFields(
          {
            name: "In-game Name",
            value: profileData.ingameName || "N/A",
            inline: true,
          },
          {
            name: "In-game ID",
            value: profileData.ingameId || "N/A",
            inline: true,
          },
          { name: "Title", value: profileData.title, inline: true },
          {
            name: "Screenshot URL",
            value: `[Click Here](${profileData.screenshotUrl})`,
            inline: true,
          },
          {
            name: "About",
            value: profileData.about || "No information provided",
            inline: false,
          }
        )
        .setImage(profileData.screenshotUrl)
        .setTimestamp()
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        });

      // Create the "Make Public" button
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("makePublic")
          .setLabel("Make Public")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("🌐")
      );

      // Edit the deferred reply with the embed and the button
      await interaction.editReply({ embeds: [embed], components: [row] });

      // Create a message component collector
      const filter = (i) =>
        i.customId === "makePublic" && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on("collect", async (i) => {
        if (i.customId === "makePublic") {
          await i.update({ components: [] }); // Remove the button
          await interaction.followUp({
            content: `Profile requested by ${interaction.user.username}:`,
            embeds: [embed],
          });
        }
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          interaction.editReply({ components: [] }).catch(console.error); // Remove the button if not clicked
        }
      });
    } catch (error) {
      console.error(chalk.red("Error in profile command:"), error);
      await interaction.editReply(
        "An error occurred while retrieving the profile. Please try again later."
      );
    }
  },
};
