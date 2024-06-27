const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Fetches the avatar of a user")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user whose avatar you want to fetch")
        .setRequired(false)
    ),
  async execute(interaction) {
    try {
      // Get the target user or default to the interaction user
      const targetUser =
        interaction.options.getUser("target") || interaction.user;

      if (!targetUser) {
        throw new Error("Invalid target user.");
      }

      // Get the avatar URL
      const avatarUrl = targetUser.displayAvatarURL({
        dynamic: true,
        size: 1024,
      });

      const embed = new EmbedBuilder()
        .setAuthor({
          name: targetUser.username,
          iconURL: avatarUrl,
        })
        .setColor("Gold")
        .setTitle("User's Avatar")
        .setImage(avatarUrl)
        .setTimestamp()
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(
        chalk.red("An error occurred while executing the avatar command:"),
        { error, userId: interaction.user.id, command: "avatar" }
      );
      await interaction.reply({
        content:
          "An error occurred while processing your command. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
