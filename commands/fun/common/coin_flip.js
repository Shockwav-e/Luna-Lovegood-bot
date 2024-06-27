const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const chalk = require("chalk");
const { Head, Tail } = require("../../../storage/flip.json");

const CoinResult = Object.freeze({
  HEADS: "Heads",
  TAILS: "Tails",
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coin_flip")
    .setDescription("Flips a coin and returns Heads or Tails")
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setDescription("Number of coin flips (maximum 9)")
        .setRequired(false)
    ),
  cooldown: 5, // Cooldown duration in seconds
  async execute(interaction) {
    try {
      const count = interaction.options.getInteger("count") || 1;
      if (!Number.isInteger(count) || count < 1 || count > 9) {
        return await interaction.reply({
          content:
            "Invalid count value. Count should be an integer between 1 and 9.",
          ephemeral: true,
        });
      }

      const { embed } = await flipCoin(count);
      const button = createButton();

      const row = new ActionRowBuilder().addComponents(button);
      const reply = await interaction.reply({
        embeds: [embed],
        components: [row],
      });

      const filter = (i) =>
        i.customId === "flip_again" && i.user.id === interaction.user.id;

      const collector = reply.createMessageComponentCollector({
        filter,
        time: 15000,
      });

      let prevMessage = reply;

      collector.on("collect", async (i) => {
        await i.deferUpdate();
        const { embed: newEmbed } = await flipCoin(count);
        const newButton = createButton();
        const newRow = new ActionRowBuilder().addComponents(newButton);
        const newMessage = await i.followUp({
          embeds: [newEmbed],
          components: [newRow],
        });

        const disabledRow = new ActionRowBuilder().addComponents(
          button.setDisabled(true)
        );
        await prevMessage.edit({ components: [disabledRow] });

        prevMessage = newMessage;
      });

      collector.on("end", async (collected) => {
        const disabledRow = new ActionRowBuilder().addComponents(
          button.setDisabled(true)
        );
        await prevMessage.edit({ components: [disabledRow] });
      });
    } catch (error) {
      console.error(
        chalk.red("An error occurred while executing the coinflip command:"),
        error
      );
      if (interaction.replied) {
        await interaction.followUp({
          content:
            "An error occurred while processing the command. Please try again later.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content:
            "An error occurred while processing the command. Please try again later.",
          ephemeral: true,
        });
      }
    }
  },
};

function createButton() {
  return new ButtonBuilder()
    .setCustomId("flip_again")
    .setLabel("Flip Again")
    .setStyle(ButtonStyle.Danger);
}

async function flipCoin(count) {
  const results = [];
  for (let i = 0; i < count; i++) {
    const result = Math.random() < 0.5 ? CoinResult.HEADS : CoinResult.TAILS;
    results.push(result);
  }
  const embed = new EmbedBuilder()
    .setColor("Gold")
    .setTitle("Coin Flip")
    .setDescription(`The coin landed on: **${results.join(", ")}**`)
    .setTimestamp();
  if (count === 1) {
    const resultImage = results[0] === CoinResult.HEADS ? Head : Tail;
    embed.setImage(resultImage);
  }
  return { embed };
}
