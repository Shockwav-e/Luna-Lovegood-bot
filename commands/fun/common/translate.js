const languageChoices = require("../../../Updator/translate_lang.js");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const translate = require("@iamtraction/google-translate");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("translate")
    .setDescription("Translate text to a specified language")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("Text to translate")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("target_language")
        .setDescription("Target language.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("private_msg")
        .setDescription("Whether the message should be sent privately.")
        .addChoices(
          { name: "True", value: "true" },
          { name: "False", value: "false" }
        )
        .setRequired(false)
    ),
  async execute(interaction) {
    const text = interaction.options.getString("text");
    const targetLanguageInput = interaction.options
      .getString("target_language")
      .toLowerCase();
    const privateMessage =
      interaction.options.getString("private_msg") === "true";

    try {
      await interaction.deferReply({ ephemeral: privateMessage }); // Defer the reply to give more time for processing

      // Check if the target language input matches any of the language choices
      const targetLanguage = languageChoices.find(
        (choice) =>
          choice.value.toLowerCase() === targetLanguageInput ||
          choice.name.toLowerCase() === targetLanguageInput
      );

      if (!targetLanguage) {
        throw new Error("not supported");
      }

      // Perform translation
      const result = await translate(text, { to: targetLanguage.value });

      //Embed Building
      const embed = new EmbedBuilder()
        .setAuthor({
          name: "Translation",
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
        })
        .setColor("Gold")
        .addFields(
          {
            name: "Original Text",
            value: text,
          },
          {
            name: "Translated Text",
            value: result.text,
          }
        )
        .setTimestamp();
      // Edit the original deferred reply with the translated text
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      let errorMessage =
        "An error occurred while processing your translation request. Please try again later.";

      // Handle specific error cases
      if (error.message.includes("not supported")) {
        errorMessage =
          "The provided language is invalid or not supported. Please check the language and try again.";
      }

      // Respond based on whether the interaction was deferred or not
      if (interaction.deferred) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({ content: errorMessage });
      }
    }
  },
};
