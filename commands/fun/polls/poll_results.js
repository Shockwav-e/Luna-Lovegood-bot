const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const storagePath = path.join(__dirname, "../../../database/polls");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll_results")
    .setDescription("Show the results of a poll.")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The poll question")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send the results to")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    try {
      if (
        !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
      ) {
        return interaction.reply({
          content: "You do not have permission to use this command.",
          ephemeral: true,
        });
      }

      const question = interaction.options.getString("question");
      const voteFilePath = path.join(
        storagePath,
        `${question.toLowerCase().replace(/\s/g, "-")}.json`
      );

      if (!fs.existsSync(voteFilePath)) {
        return interaction.reply({
          content: `Poll with the question "${question}" does not exist.`,
          ephemeral: true,
        });
      }

      await showPollResults(interaction, question);
    } catch (error) {
      console.error(
        chalk.red("An error occurred while fetching the poll results:"),
        chalk.red(error)
      );
      await interaction.reply({
        content: "An error occurred while fetching the poll results.",
        ephemeral: true,
      });
    }
  },
};

async function showPollResults(interaction, question) {
  const voteFilePath = path.join(
    storagePath,
    `${question.toLowerCase().replace(/\s/g, "-")}.json`
  );
  const pollData = JSON.parse(fs.readFileSync(voteFilePath, "utf8"));
  const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
  const options = Object.keys(pollData.options);
  const resultsEmbed = new EmbedBuilder()
    .setTitle("Poll Results")
    .setDescription(`**${pollData.question}**`)
    .setColor("Green");

  options.forEach((option, index) => {
    resultsEmbed.addFields({
      name: `${emojis[index]} ${option}`,
      value: `${pollData.options[option]} vote(s)`,
      inline: true,
    });
  });

  const sendToChannel = interaction.options.getChannel("channel");
  if (sendToChannel) {
    await sendToChannel.send({ embeds: [resultsEmbed] });
    await interaction.reply(`Poll results have been sent to ${sendToChannel}`);
  } else {
    await interaction.reply({ embeds: [resultsEmbed] });
  }
}
