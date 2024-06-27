const { SlashCommandBuilder } = require("discord.js");
const chalk = require("chalk");
const { ownerId } = require("../../../config/config.json");
const KICK_GIF_URL =
  "https://tenor.com/view/asdf-movie-punt-kick-donewiththis-gif-26537188";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fake_say")
    .setDescription("Say as someone else")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message for the bot to say")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to say as")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send the message to")
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
    try {
      // Check if the user is the bot owner
      if (interaction.user.id !== ownerId) {
        await interaction.reply({
          content: KICK_GIF_URL,
          ephemeral: true,
        });
        return;
      }

      // Defer the reply to allow more processing time
      await interaction.deferReply({ ephemeral: true });

      const message = interaction.options.getString("message");
      const targetUser = interaction.options.getUser("target");
      const targetChannel =
        interaction.options.getChannel("channel") || interaction.channel;
      const attachments = [];
      for (let i = 1; i <= 5; i++) {
        const attachment = interaction.options.getAttachment(`attachment${i}`);
        if (attachment) {
          attachments.push(attachment);
        }
      }

      // Create and use a webhook
      const webhook = await targetChannel.createWebhook({
        name: targetUser.globalName || targetUser.username,
        avatar: targetUser.displayAvatarURL({ format: "png" }),
      });

      const files = attachments.map((attachment) => ({
        attachment: attachment.url,
        name: attachment.name,
      }));

      await webhook.send({
        content: message,
        files: files,
      });

      // Delete the webhook after sending the message
      await webhook.delete();

      await interaction.followUp({
        content:
          `Message sent as ${
            targetUser.globalName || targetUser.username
          }: "${message}"` +
          (attachments.length > 0
            ? `\nAttachments: ${attachments.map((att) => att.name).join(", ")}`
            : ""),
        ephemeral: true,
      });
    } catch (error) {
      console.error(
        chalk.red("An error occurred while executing the fakesay command:"),
        error
      );

      // Check if the interaction has already been replied to
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({
          content: "An error occurred while processing the command.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "An error occurred while processing the command.",
          ephemeral: true,
        });
      }
    }
  },
};
