const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("choose")
    .setDescription("Randomly choose from provided options")
    .addStringOption((option) =>
      option
        .setName("options")
        .setDescription("Options separated by commas")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setDescription("Number of choices to make")
        .setRequired(false)
    ),
  async execute(interaction) {
    try {
      let options = interaction.options
        .getString("options")
        .split(",")
        .map((option) => option.trim())
        .filter((option) => option); // Filter out any empty strings

      const count = interaction.options.getInteger("count") || 1;

      if (options.length < 2) {
        return interaction.reply({
          content: "Please provide at least 2 options.",
          ephemeral: true,
        });
      }

      if (count < 1 || count > options.length) {
        return interaction.reply({
          content:
            "Invalid count value. Count should be between 1 and the number of options provided.",
          ephemeral: true,
        });
      }

      const chosenOptions = [];
      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * options.length);
        chosenOptions.push(options[randomIndex]);
        options.splice(randomIndex, 1); // Remove the chosen option
      }

      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("Random Choice")
        .setDescription(`I choose: **${chosenOptions.join(", ")}**`)
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (error) {
      console.error(
        chalk.red("An error occurred while executing the choose command:"),
        error
      );
      await interaction.reply({
        content: "An error occurred while processing the command.",
        ephemeral: true,
      });
    }
  },
};
