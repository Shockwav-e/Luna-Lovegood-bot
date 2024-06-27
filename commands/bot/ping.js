const { SlashCommandBuilder } = require("discord.js");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with the bot's ping"),
  async execute(interaction) {
    try {
      // Send initial ping message
      const sent = await interaction.reply({
        content: "<:c_ping:1063112686650540072> Pinging...",
        fetchReply: true,
        ephemeral: true,
      });

      // Calculate bot's latency
      const ping = sent.createdTimestamp - interaction.createdTimestamp;

      // Get heartbeat latency
      const heartbeatLatency = interaction.client.ws.ping;

      // Calculate API latency (bot's latency + heartbeat latency)
      const apiLatency = Math.round(interaction.client.ws.ping + ping);

      // Edit initial message to include latency details
      await interaction.editReply({
        content: `<:c_ping:1063112686650540072> Pong!\nBot's latency: ${ping}ms\nHeartbeat latency: ${heartbeatLatency}ms\nAPI latency: ${apiLatency}ms`,
        ephemeral: true,
      });
    } catch (error) {
      // Log and handle errors
      console.error(
        chalk.red("An error occurred while executing the ping command:"),
        error
      );
      // Reply with error message
      await interaction.reply({
        content: "An error occurred while processing the command.",
        ephemeral: true,
      });
    }
  },
};
