const { SlashCommandBuilder } = require("discord.js");
const chalk = require("chalk");
const { ownerId } = require("../../../config/config.json");
const KICK_GIF_URL =
  "https://tenor.com/view/asdf-movie-punt-kick-donewiththis-gif-26537188";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Makes the bot say something")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message for the bot to say")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send the message in")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("attachment1")
        .setDescription("Optional attachment 1")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("attachment2")
        .setDescription("Optional attachment 2")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("attachment3")
        .setDescription("Optional attachment 3")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("attachment4")
        .setDescription("Optional attachment 4")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("attachment5")
        .setDescription("Optional attachment 5")
        .setRequired(false)
    ),
  async execute(interaction) {
    // Early return if the user is not the bot owner
    if (interaction.user.id !== ownerId) {
      await interaction.reply({
        content: KICK_GIF_URL,
        ephemeral: true,
      });
      return;
    }

    // Get the message and channel from the options
    const message = interaction.options.getString("message");
    const channel =
      interaction.options.getChannel("channel") || interaction.channel;
    const attachments = [];

    for (let i = 1; i <= 5; i++) {
      const attachment = interaction.options.getAttachment(`attachment${i}`);
      if (attachment) {
        attachments.push(attachment);
      }
    }

    // Ensure the bot does not respond to itself
    if (interaction.user.bot) {
      await interaction.reply({
        content: "The bot cannot say messages.",
        ephemeral: true,
      });
      return;
    }

    // Create reply content
    let replyContent = `You said: "${message}"`;

    if (attachments.length > 0) {
      replyContent += `\nAttachments: ${attachments
        .map((att) => att.name)
        .join(", ")}`;
    }

    // Respond to the interaction first
    await interaction.reply({
      content: replyContent,
      ephemeral: true,
    });

    // Send the message and attachments (if provided) to the specified channel
    try {
      if (attachments.length > 0) {
        await channel.send({
          content: message,
          files: attachments,
        });
      } else {
        await channel.send(message);
      }
    } catch (error) {
      console.error(
        chalk.red(
          "An error occurred while sending the message to the channel:"
        ),
        error
      );
      await interaction.followUp({
        content: "An error occurred while sending the message to the channel.",
        ephemeral: true,
      });
    }
  },
};
