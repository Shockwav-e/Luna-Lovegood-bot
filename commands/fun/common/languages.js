const { SlashCommandBuilder } = require("discord.js");
const languageChoices = require("../../../Updator/translate_lang.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("languages")
    .setDescription("Get the list of available languages"),

  async execute(interaction) {
    const languageList = languageChoices.map((lang) => lang.name).join(" , ");
    await interaction.reply({
      content: `The following languages are available:\n${languageList}`,
      ephemeral: true,
    });
  },
};
