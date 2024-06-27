const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("enlarge")
    .setDescription("Enlarges a provided emoji")
    .addStringOption((option) =>
      option
        .setName("emoji")
        .setDescription("The emoji you want to enlarge")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const emojiInput = interaction.options.getString("emoji");
      const customEmojiRegex = /<(a)?:\w+:(\d+)>/;
      const match = emojiInput.match(customEmojiRegex);

      let emojiId;
      let isAnimated = false;

      if (match) {
        isAnimated = Boolean(match[1]);
        emojiId = match[2];
      } else if (/^\d+$/.test(emojiInput)) {
        emojiId = emojiInput;
        const emoji = interaction.guild.emojis.cache.get(emojiId);
        if (emoji) {
          isAnimated = emoji.animated;
        }
      }

      if (emojiId) {
        const fileType = isAnimated ? "gif" : "png";
        const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${fileType}?size=1024`;

        const embed = new EmbedBuilder()
          .setAuthor({
            name: `Emoji Enlarged!`,
            iconURL: emojiUrl,
          })
          .setTitle(`Emoji: ${fileType.toUpperCase()} (ID: ${emojiId})`)
          .setImage(emojiUrl)
          .setColor("DarkGreen")
          .setTimestamp()
          .setFooter({
            text: `Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply({
          content: `Here is your enlarged emoji: ${emojiInput}`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(
        chalk.red("An error occurred while executing the enlarge command:"),
        { error, userId: interaction.user.id, command: "enlarge" }
      );
      await interaction.reply({
        content:
          "An error occurred while processing your command. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
