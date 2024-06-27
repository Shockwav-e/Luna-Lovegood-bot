const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  PermissionFlagsBits,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const storagePath = path.join(__dirname, "../../../database/polls");

function parseDuration(durationStr) {
  const durationRegex = /(\d+d)?(\d+h)?(\d+m)?(\d+s)?/;
  const matches = durationStr.match(durationRegex);
  let totalSeconds = 0;

  if (matches) {
    const days = matches[1] ? parseInt(matches[1]) : 0;
    const hours = matches[2] ? parseInt(matches[2]) : 0;
    const minutes = matches[3] ? parseInt(matches[3]) : 0;
    const seconds = matches[4] ? parseInt(matches[4]) : 0;

    totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;
  }

  return totalSeconds;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a simple poll with a duration.")
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Poll duration (e.g., 2d5h30m10s)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The poll question")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("option1").setDescription("First option").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("option2")
        .setDescription("Second option")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("option3")
        .setDescription("Third option")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option4")
        .setDescription("Fourth option")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option5")
        .setDescription("Fifth option")
        .setRequired(false)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send the poll in")
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
      const options = [
        interaction.options.getString("option1"),
        interaction.options.getString("option2"),
        interaction.options.getString("option3"),
        interaction.options.getString("option4"),
        interaction.options.getString("option5"),
      ].filter(Boolean);
      const durationStr = interaction.options.getString("duration");
      const duration = parseDuration(durationStr);
      const targetChannel =
        interaction.options.getChannel("channel") || interaction.channel;

      if (duration < 10 || duration > 86400 * 7) {
        return interaction.reply({
          content: "Duration must be between 10 seconds and 7 days.",
          ephemeral: true,
        });
      }

      const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
      const pollDescription = options
        .map((option, index) => `${emojis[index]} ${option}`)
        .join("\n");

      const pollEmbed = new EmbedBuilder()
        .setTitle("Polls 📊")
        .setDescription(`**${question}**\n\n${pollDescription}`)
        .setColor("Gold");

      const buttons = new ActionRowBuilder().addComponents(
        options.map((option, index) =>
          new ButtonBuilder()
            .setCustomId(`vote_${index}`)
            .setLabel(`${emojis[index]} ${option}`)
            .setStyle(ButtonStyle.Primary)
        )
      );

      const pollMessage = await targetChannel.send({
        embeds: [pollEmbed],
        components: [buttons],
      });

      const voteFilePath = path.join(
        storagePath,
        `${question.toLowerCase().replace(/\s/g, "-")}.json`
      );

      const pollData = {
        question,
        endTime: Date.now() + duration * 1000,
        messageId: pollMessage.id,
        votes: {},
        options: options.reduce((acc, option) => {
          acc[option] = 0;
          return acc;
        }, {}),
      };

      fs.writeFileSync(voteFilePath, JSON.stringify(pollData, null, 2));

      const collector = pollMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: duration * 1000,
      });

      collector.on("collect", async (i) => {
        if (i.user.bot) return;

        const userId = i.user.id;
        const username = i.user.username;
        const voteIndex = parseInt(i.customId.split("_")[1]);

        if (pollData.votes[userId]) {
          await i.reply({
            content: `You have already voted for: ${
              options[pollData.votes[userId].voteIndex]
            }`,
            ephemeral: true,
          });
        } else {
          pollData.votes[userId] = { username, voteIndex };
          pollData.options[options[voteIndex]]++;
          fs.writeFileSync(voteFilePath, JSON.stringify(pollData, null, 2));
          await i.reply({
            content: `You voted for: ${options[voteIndex]}`,
            ephemeral: true,
          });
        }
      });

      collector.on("end", async () => {
        const results = options.map((option, index) => ({
          option,
          count: pollData.options[option],
        }));

        const resultsEmbed = new EmbedBuilder()
          .setTitle("Poll Results")
          .setDescription(`**${question}**`)
          .setColor("Green")
          .addFields(
            results.map((result, index) => ({
              name: `${emojis[index]} ${result.option}`,
              value: `${result.count} vote(s)`,
              inline: true,
            }))
          );

        await targetChannel.send({ embeds: [resultsEmbed] });
      });

      await interaction.reply({
        content: `Poll has been created in ${targetChannel}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(
        "An error occurred while executing the poll command:",
        error
      );
      await interaction.reply({
        content: "An error occurred while processing the command.",
        ephemeral: true,
      });
    }
  },
};
