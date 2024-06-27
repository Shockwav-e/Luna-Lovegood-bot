const { SlashCommandBuilder } = require("discord.js");
const chalk = require("chalk");

const { ownerId } = require("../../../config/config.json");

const KICK_GIF_URL =
  "https://tenor.com/view/asdf-movie-punt-kick-donewiththis-gif-26537188";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dm")
    .setDescription("Send a direct message to a specified user")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to DM")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message to send")
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
      option
        .setName("attachment1")
        .setDescription("Attachment 1")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("attachment2")
        .setDescription("Attachment 2")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("attachment3")
        .setDescription("Attachment 3")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("attachment4")
        .setDescription("Attachment 4")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("attachment5")
        .setDescription("Attachment 5")
        .setRequired(false)
    ),
  async execute(interaction) {
    try {
      // Check if the user is the bot owner
      if (interaction.user.id !== ownerId) {
        await interaction.reply({
          content: KICK_GIF_URL,
          ephemeral: true,
        });
        return;
      }

      const targetUser = interaction.options.getUser("target");
      const message = interaction.options.getString("message");

      // Collect attachment URLs
      const attachments = [
        interaction.options.getAttachment("attachment1"),
        interaction.options.getAttachment("attachment2"),
        interaction.options.getAttachment("attachment3"),
        interaction.options.getAttachment("attachment4"),
        interaction.options.getAttachment("attachment5"),
      ].filter((attachment) => attachment !== null); // Remove null values

      // Check if the target user is the bot itself or another bot
      if (targetUser.bot) {
        await interaction.reply({
          content: "Cannot send a DM to a bot.",
          ephemeral: true,
        });
        return;
      }

      // Send DM to the target user
      await targetUser.send({
        content: message,
        files: attachments.map((attachment) => attachment.url),
      });

      await interaction.reply({
        content: `Message sent to ${targetUser.username}: "${message}"`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(
        chalk.red("An error occurred while executing the dm command:"),
        error
      );
      // Ensure only one reply is sent
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "An error occurred while sending the DM.",
          ephemeral: true,
        });
      } else if (interaction.deferred) {
        await interaction.followUp({
          content: "An error occurred while sending the DM.",
          ephemeral: true,
        });
      }
    }
  },
};
