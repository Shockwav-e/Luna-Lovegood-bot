const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Displays how long the bot has been running"),
  async execute(interaction) {
    try {
      if (!interaction.guild) {
        // Command can only be used in guilds, not in DMs
        return interaction.reply({
          content: "This command can only be used in servers.",
          ephemeral: true,
        });
      }

      const { client } = interaction;
      const uptimeSeconds = process.uptime();
      const uptimeDays = Math.floor(uptimeSeconds / (3600 * 24));
      const uptimeHours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
      const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
      const uptimeSecondsLeft = Math.floor(uptimeSeconds % 60);

      const uptimeString = `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSecondsLeft}s`;

      const embed = new EmbedBuilder()
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        })
        .setColor("DarkGreen")
        .setTitle("Bot Uptime")
        .setDescription(`The bot has been running for: ${uptimeString}`)
        .setTimestamp()
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(
        "An error occurred while executing the uptime command:",
        error
      );
      await interaction.reply({
        content: "An error occurred while processing the command.",
        ephemeral: true,
      });
    }
  },
};
