const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("player_info")
    .setDescription("Get information about a specified player")
    .addStringOption((option) =>
      option
        .setName("game_id")
        .setDescription("Player's Game ID to get information about")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const game_id = interaction.options.getString("game_id");

      // Read the contents of the directory containing the JSON files
      const directoryPath = path.join(__dirname, "../../database/profiles");
      const files = fs.readdirSync(directoryPath);

      let foundUser = null;

      // Iterate over each file and find the one that matches the game ID
      for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const content = fs.readFileSync(filePath, "utf8");
        const userData = JSON.parse(content);

        if (userData.ingameId === game_id) {
          foundUser = userData;
          break;
        }
      }

      if (!foundUser) {
        return interaction.reply({
          content: "User with the specified game ID not found.",
          ephemeral: true,
        });
      }

      const foundUserId = foundUser.userId;
      const foundPlayer = interaction.guild.members.cache.get(foundUserId);

      let authorObject = {};
      if (foundPlayer) {
        authorObject = {
          name: foundPlayer.user.username,
          iconURL: foundPlayer.user.displayAvatarURL({ dynamic: true }),
        };
      }

      // Create an embed message with the user's information
      const embed = new EmbedBuilder()
        .setAuthor(authorObject)
        .setTitle(`Player Information for ${foundUser.ingameName}`)
        .setColor(`Gold`)
        .setImage(foundUser.screenshotUrl)
        .setDescription(`Discord Tag: <@${foundUser.userId}>`)
        .addFields(
          { name: "Username", value: foundUser.username, inline: true },
          { name: "In-Game Name", value: foundUser.ingameName, inline: true },
          { name: "In-Game ID", value: foundUser.ingameId, inline: false },
          { name: "Title", value: foundUser.title || "None", inline: true },
          { name: "Profile URL", value: foundUser.profileUrl, inline: true },
          { name: "About", value: foundUser.about || "None", inline: false }
        )
        .setFooter({
          text: `Requested By ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      // Send the embed message
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(
        chalk.red("An error occurred during command execution:", error)
      );
      interaction.reply({
        content:
          "An error occurred while processing your request. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
