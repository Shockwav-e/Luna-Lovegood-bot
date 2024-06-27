const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed_edit")
    .setDescription("Edit an existing embed")
    .addStringOption((option) =>
      option
        .setName("message_link")
        .setDescription("The link to the message containing the embed to edit")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("The new title of the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("The new description of the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("The new color of the embed")
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
        .setDescription("The new footer of the embed")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("footer_icon")
        .setDescription("The new footer icon of the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("author")
        .setDescription("The new author of the embed")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("author_icon")
        .setDescription("The new author icon of the embed")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("thumbnail")
        .setDescription("The new thumbnail of the embed")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("The new image of the embed")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const messageLink = interaction.options.getString("message_link");
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    let color = interaction.options.getString("color");
    const footer = interaction.options.getString("footer");
    const author = interaction.options.getString("author");
    const footerIcon = interaction.options.getAttachment("footer_icon");
    const authorIcon = interaction.options.getAttachment("author_icon");
    const thumbnail = interaction.options.getAttachment("thumbnail");
    const image = interaction.options.getAttachment("image");

    const linkRegex = /https:\/\/discord.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
    const match = messageLink.match(linkRegex);

    if (!match) {
      return interaction.editReply({
        content: "Invalid message link format.",
      });
    }

    const [, guildId, channelId, messageId] = match;

    if (guildId !== interaction.guild.id) {
      return interaction.editReply({
        content: "The message link does not belong to this guild.",
      });
    }

    try {
      const channel = await interaction.guild.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) {
        return interaction.editReply({
          content: "The channel is either not found or not a text channel.",
        });
      }

      const message = await channel.messages.fetch(messageId);
      if (!message) {
        return interaction.editReply({
          content: "Message not found.",
        });
      }

      if (message.author.id !== interaction.client.user.id) {
        return interaction.editReply({
          content: "You are not the author of the message.",
        });
      }

      const oldEmbed = message.embeds[0];
      if (!oldEmbed) {
        return interaction.editReply({
          content: "The message does not contain an embed.",
        });
      }

      const newEmbed = EmbedBuilder.from(oldEmbed);

      if (title) newEmbed.setTitle(title);
      if (description) newEmbed.setDescription(description);
      if (color) newEmbed.setColor(color);
      if (footer)
        newEmbed.setFooter({
          text: footer,
          iconURL: footerIcon ? footerIcon.url : oldEmbed.footer?.iconURL,
        });
      if (author)
        newEmbed.setAuthor({
          name: author,
          iconURL: authorIcon ? authorIcon.url : oldEmbed.author?.iconURL,
        });
      if (thumbnail) newEmbed.setThumbnail(thumbnail.url);
      if (image) newEmbed.setImage(image.url);

      await message.edit({ embeds: [newEmbed] });
      return interaction.editReply({
        content: "Embed edited successfully.",
      });
    } catch (error) {
      console.error(chalk.red("Error editing embed:", error));
      return interaction.editReply({
        content: "There was an error editing the embed.",
      });
    }
  },
};
