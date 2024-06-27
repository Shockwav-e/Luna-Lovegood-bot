const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collector,
} = require("discord.js");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Create an embed")
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("The title of the embed")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("The description of the embed")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("The color of the embed")
        .setRequired(false)
        .addChoices(
          { name: "Red", value: "Red" },
          { name: "Green", value: "Green" },
          { name: "Blue", value: "Blue" },
          { name: "Yellow", value: "Yellow" },
          { name: "Purple", value: "Purple" },
          { name: "Orange", value: "Orange" },
          { name: "Grey", value: "Grey" },
          { name: "Random", value: "Random" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("footer")
        .setDescription("The footer of the embed")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("footer_icon")
        .setDescription("The footer icon of the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("author")
        .setDescription("The author of the embed")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("author_icon")
        .setDescription("The author icon of the embed")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("thumbnail")
        .setDescription("The thumbnail of the embed")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("The image of the embed")
        .setRequired(false)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send the message in")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    try {
      // Defer initial reply immediately
      await interaction.deferReply({ ephemeral: true });

      // Check member permissions
      if (
        !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
      ) {
        return interaction.editReply({
          content: "You do not have permission to use this command.",
          ephemeral: true,
        });
      }

      // Retrieve options
      const title = interaction.options.getString("title");
      const description = interaction.options.getString("description");
      let color = interaction.options.getString("color");
      const footer = interaction.options.getString("footer");
      const author = interaction.options.getString("author");
      const footerIcon = interaction.options.getAttachment("footer_icon");
      const authorIcon = interaction.options.getAttachment("author_icon");
      const thumbnail = interaction.options.getAttachment("thumbnail");
      const image = interaction.options.getAttachment("image");
      const channel =
        interaction.options.getChannel("channel") || interaction.channel;

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color || null)
        .setTimestamp()
        .setFooter(
          footer
            ? { text: footer, iconURL: footerIcon ? footerIcon.url : null }
            : null
        )
        .setAuthor(
          author
            ? { name: author, iconURL: authorIcon ? authorIcon.url : null }
            : null
        )
        .setThumbnail(thumbnail ? thumbnail.url : null)
        .setImage(image ? image.url : null);

      // Create action row with buttons
      const publish = new ButtonBuilder()
        .setCustomId("publish")
        .setLabel("Publish")
        .setStyle(ButtonStyle.Success)
        .setEmoji("✅");

      const cancel = new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("❌");

      const row = new ActionRowBuilder().addComponents(publish, cancel);

      // Edit initial reply with embed and buttons
      const replyMessage = await interaction.editReply({
        embeds: [embed],
        components: [row],
        fetchReply: true,
        ephemeral: true,
      });

      // Create collector for button interactions
      const collector = replyMessage.createMessageComponentCollector({
        time: 60000,
      });

      // Handle button interactions
      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
          await i.reply({
            content:
              "You do not have permission to interact with these buttons.",
            ephemeral: true,
          });
          return;
        }
        if (i.customId === "publish") {
          await channel.send({ embeds: [embed] });
          await i.update({
            content: "Embed published!",
            components: [],
            ephemeral: true,
          });
        } else if (i.customId === "cancel") {
          await i.update({
            content: "Embed creation cancelled.",
            components: [],
            ephemeral: true,
          });
        }
      });

      // Handle end of collector
      collector.on("end", async (collected, reason) => {
        if (reason !== "messageDelete") {
          try {
            await replyMessage.edit({ components: [] });
          } catch (error) {
            if (error.code !== 10008) {
              console.error(chalk.red("Failed to edit message:", error));
            } else {
              console.warn(
                chalk.red("Message was deleted before it could be edited.")
              );
            }
          }
        }
      });
    } catch (error) {
      console.error(chalk.red("Error executing command:", error));
      await interaction.editReply({
        content: "There was an error while executing this command.",
        ephemeral: true,
      });
    }
  },
};
