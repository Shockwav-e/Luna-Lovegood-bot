const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete a specified number of messages from the channel.")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The number of messages to delete (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    try {
      if (!interaction.guild) {
        await interaction.reply({
          content: "This command must be used in a server.",
          ephemeral: true,
        });
        return;
      }

      const amount = interaction.options.getInteger("amount");

      if (
        !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)
      ) {
        await interaction.reply({
          content: "You do not have permission to use this command!",
          ephemeral: true,
        });
        return;
      }

      const botMember = await interaction.guild.members.fetch(
        interaction.client.user.id
      );
      if (!botMember.permissions.has(PermissionFlagsBits.ManageMessages)) {
        await interaction.reply({
          content:
            "I do not have permission to manage messages. Please contact the server managers!",
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });

      const fetchedMessages = await interaction.channel.messages.fetch({
        limit: amount,
      });
      const messagesToDelete = fetchedMessages.filter(
        (msg) => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000
      );
      const oldMessages = fetchedMessages.filter(
        (msg) => Date.now() - msg.createdTimestamp >= 14 * 24 * 60 * 60 * 1000
      );

      let deletedCount = 0;

      if (messagesToDelete.size > 0) {
        const deletedMessages = await interaction.channel.bulkDelete(
          messagesToDelete,
          true
        );
        deletedCount += deletedMessages.size;
      }

      for (const [id, msg] of oldMessages) {
        await msg.delete();
        deletedCount++;
        if (deletedCount >= amount) break;
      }

      await interaction.followUp({
        content: `Successfully deleted ${deletedCount} message(s).`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(chalk.red(`Error deleting messages: ${error}`));
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "An error occurred while deleting messages.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "An error occurred while deleting messages.",
          ephemeral: true,
        });
      }
    }
  },
};
