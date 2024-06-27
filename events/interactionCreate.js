const { Events, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const storagePath = path.join(__dirname, "../database/polls");

const cooldowns = new Collection();

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "I am responding to commands in servers only.",
        ephemeral: true,
      });
      return;
    }
    if (interaction.isAutocomplete()) {
      if (interaction.commandName === "poll_results") {
        const focusedValue = interaction.options.getFocused();
        const pollFiles = fs.readdirSync(storagePath).map((file) => ({
          name: file.replace(".json", "").replace(/-/g, " "),
          value: file.replace(".json", ""),
        }));
        const choices = pollFiles.filter((choice) =>
          choice.name.toLowerCase().startsWith(focusedValue.toLowerCase())
        );
        await interaction.respond(choices.slice(0, 25));
      }
      return;
    }

    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      // Check cooldowns
      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name);
      const cooldownAmount = (command.cooldown || 3) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime =
          timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return interaction.reply({
            content: `Please wait ${timeLeft.toFixed(
              1
            )} more second(s) before reusing the \`${
              command.data.name
            }\` command.`,
            ephemeral: true,
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
