const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user from the server.")
    .addStringOption((option) =>
      option
        .setName("user_id")
        .setDescription("The ID of the user to unban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the unban")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command must be used in a server.",
        ephemeral: true,
      });
      return;
    }

    const userId = interaction.options.getString("user_id");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      await interaction.reply({
        content: "You do not have permission to use this command!",
        ephemeral: true,
      });
      return;
    }

    const botMember = await interaction.guild.members.fetch(
      interaction.client.user.id
    );
    if (!botMember.permissions.has(PermissionFlagsBits.BanMembers)) {
      await interaction.reply({
        content:
          "I do not have permission to unban members. Please contact the server managers!",
        ephemeral: true,
      });
      return;
    }

    try {
      // Check if the user is banned
      const banList = await interaction.guild.bans.fetch();
      const bannedUser = banList.get(userId);

      if (!bannedUser) {
        await interaction.reply({
          content: "The user is not banned or you provided an invalid user ID.",
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });

      await interaction.guild.members.unban(userId, reason);

      await interaction.followUp({
        content: `Successfully unbanned **<@${userId}>** for: **${reason}**.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(chalk.red(`Error unbanning the user: ${error}`));
      await interaction.followUp({
        content: "An error occurred while unbanning the user.",
        ephemeral: true,
      });
    }
  },
};
