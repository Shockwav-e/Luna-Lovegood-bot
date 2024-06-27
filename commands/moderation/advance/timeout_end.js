const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout_end")
    .setDescription("Remove the timeout for a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to remove the timeout for")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command must be used in a server.",
        ephemeral: true,
      });
      return;
    }

    const targetUser = interaction.options.getUser("user");

    if (!targetUser) {
      await interaction.reply({
        content: "Please specify a valid user.",
        ephemeral: true,
      });
      return;
    }

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)
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
    if (!botMember.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await interaction.reply({
        content:
          "I do not have permission to remove timeouts. Please contact the server managers!",
        ephemeral: true,
      });
      return;
    }

    const targetMember = await interaction.guild.members.fetch(targetUser.id);

    if (targetUser.id === interaction.client.user.id) {
      await interaction.reply({
        content: "I cannot remove a timeout for myself!",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    // Check if the user has a timeout set
    if (!targetMember.timeout) {
      await interaction.followUp({
        content: `**${targetUser.tag}** is not currently timed out.`,
        ephemeral: true,
      });
      return;
    }

    try {
      await targetMember.timeout(1);

      await interaction.followUp({
        content: `Timeout removed for **${targetUser.tag}**.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(chalk.red(`Error removing timeout for the user: ${error}`));
      await interaction.followUp({
        content: "An error occurred while removing the timeout for the user.",
        ephemeral: true,
      });
    }
  },
};
