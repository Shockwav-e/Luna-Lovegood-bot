const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moment = require("moment-timezone");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("convert")
    .setDescription("Converts time between time zones")
    .addIntegerOption((option) =>
      option
        .setName("year")
        .setDescription("The year (e.g., 2024)")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(9999)
    )
    .addIntegerOption((option) =>
      option
        .setName("month")
        .setDescription("The month (1-12)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(12)
    )
    .addIntegerOption((option) =>
      option
        .setName("day")
        .setDescription("The day of the month (1-31)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(31)
    )
    .addIntegerOption((option) =>
      option.setName("hour").setDescription("The hour (0-23)").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("minute")
        .setDescription("The minute (0-59)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("to")
        .setDescription("The target time zone")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("from")
        .setDescription("The original time zone, default is UTC")
        .setRequired(false)
    ),
  async execute(interaction) {
    try {
      // Get input values
      const year = interaction.options.getInteger("year");
      const month = interaction.options.getInteger("month") - 1; // Moment.js months are 0-indexed
      const day = interaction.options.getInteger("day");
      const hour = interaction.options.getInteger("hour");
      const minute = interaction.options.getInteger("minute");
      const fromTz = interaction.options.getString("from") || "UTC";
      const toTz = interaction.options.getString("to");

      // Validate time zones
      if (!moment.tz.zone(fromTz) || !moment.tz.zone(toTz)) {
        await interaction.reply({
          content: `Invalid time zone provided. Please use valid time zones (e.g., UTC, Asia/Kolkata).`,
          ephemeral: true,
        });
        return;
      }

      // Create a moment object with specified components
      const fromTime = moment.tz(
        { year, month, date: day, hours: hour, minutes: minute },
        fromTz
      );
      const toTime = fromTime.clone().tz(toTz);

      // Format the converted time
      const formattedTime = toTime.format("YYYY-MM-DD HH:mm:ss z");

      // Reply with the converted time
      const embed = new EmbedBuilder()
        .setAuthor({
          name: "Time Conversion",
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
        })
        .setColor("Gold")
        .addFields(
          {
            name: fromTz,
            value: fromTime.format("YYYY-MM-DD HH:mm"),
            inline: false,
          },
          {
            name: toTz,
            value: formattedTime,
            inline: false,
          }
        )
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (error) {
      // Log and handle errors
      console.error(
        chalk.red(
          "An error occurred while executing the convert-time command:"
        ),
        error
      );
      // Reply with error message
      if (!interaction.replied) {
        await interaction.reply({
          content: "An error occurred while processing the command.",
          ephemeral: true,
        });
      }
    }
  },
};
