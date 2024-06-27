const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const chalk = require("chalk");

// Function to parse duration string and convert to milliseconds
function parseDuration(duration) {
  const regex = /(\d+)([dhms])/g;
  let totalMilliseconds = 0;
  let match;

  while ((match = regex.exec(duration)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case "d":
        totalMilliseconds += value * 24 * 60 * 60 * 1000; // days to ms
        break;
      case "h":
        totalMilliseconds += value * 60 * 60 * 1000; // hours to ms
        break;
      case "m":
        totalMilliseconds += value * 60 * 1000; // minutes to ms
        break;
      case "s":
        totalMilliseconds += value * 1000; // seconds to ms
        break;
      default:
        throw new Error("Invalid time unit");
    }
  }

  return totalMilliseconds;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a user in the server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to timeout")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration of the timeout (e.g., 2d, 30h, 1d12h)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the timeout")
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

    const targetUser = interaction.options.getUser("user");
    const durationString = interaction.options.getString("duration");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

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
          "I do not have permission to timeout members. Please contact the server managers!",
        ephemeral: true,
      });
      return;
    }

    const targetMember = await interaction.guild.members.fetch(targetUser.id);

    if (targetUser.id === interaction.client.user.id) {
      await interaction.reply({
        content: "I cannot timeout myself!",
        ephemeral: true,
      });
      return;
    }

    if (targetUser.id === interaction.user.id) {
      await interaction.reply({
        content: "You cannot timeout yourself.",
        ephemeral: true,
      });
      return;
    }

    if (!targetMember.moderatable) {
      await interaction.reply({
        content:
          "I cannot timeout this user. They might have higher roles or I might lack permissions.",
        ephemeral: true,
      });
      return;
    }

    if (
      targetMember.roles.highest.position >=
      interaction.member.roles.highest.position
    ) {
      await interaction.reply({
        content:
          "You cannot timeout a member with a role higher than or equal to your highest role.",
        ephemeral: true,
      });
      return;
    }

    if (
      targetMember.roles.highest.position >= botMember.roles.highest.position
    ) {
      await interaction.reply({
        content:
          "I cannot timeout a member with a role higher than or equal to my highest role.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const timeoutDuration = parseDuration(durationString);

      if (isNaN(timeoutDuration) || timeoutDuration <= 0) {
        await interaction.followUp({
          content:
            'Invalid duration format. Please use a valid format such as "2d", "30h", "1d12h".',
          ephemeral: true,
        });
        return;
      }

      // Ensure the timeout duration does not exceed the maximum allowed by Discord (28 days)
      const maxDuration = 28 * 24 * 60 * 60 * 1000; // 28 days in milliseconds
      if (timeoutDuration > maxDuration) {
        await interaction.followUp({
          content: "The timeout duration cannot exceed 28 days.",
          ephemeral: true,
        });
        return;
      }

      await targetMember.timeout(timeoutDuration, reason);

      await interaction.followUp({
        content: `Successfully timed out **${targetUser.tag}** for **${durationString}** for: **${reason}**.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(chalk.red(`Error timing out the user: ${error}`));
      await interaction.followUp({
        content: "An error occurred while timing out the user.",
        ephemeral: true,
      });
    }
  },
};
