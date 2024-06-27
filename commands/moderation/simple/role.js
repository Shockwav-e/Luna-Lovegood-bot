const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const chalk = require("chalk");
const { ownerId } = require("../../../config/config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Manage roles for a specified user")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to manage roles for")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role to add or remove")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Add or remove the role")
        .setRequired(true)
        .addChoices(
          { name: "Add", value: "add" },
          { name: "Remove", value: "remove" }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    try {
      if (!interaction.guild) {
        await interaction.reply({
          content: "This command must be used in a server.",
          ephemeral: true,
        });
        return;
      }

      const targetUser = interaction.options.getUser("target");
      const role = interaction.options.getRole("role");
      const action = interaction.options.getString("action");
      const member = await interaction.guild.members.fetch(targetUser.id);
      const executor = interaction.member;

      if (!targetUser || !role) {
        await interaction.reply({
          content: "Please specify a valid user and role.",
          ephemeral: true,
        });
        return;
      }

      const botMember = await interaction.guild.members.fetch(
        interaction.client.user.id
      );

      const isServerOwner = interaction.guild.ownerId === executor.id;
      const isBotOwner = executor.id === ownerId; // Replace with the actual bot owner's user ID

      if (!isServerOwner && !isBotOwner) {
        if (role.position >= botMember.roles.highest.position) {
          await interaction.reply({
            content: "The specified role is higher than my highest role.",
            ephemeral: true,
          });
          return;
        }

        if (!executor.permissions.has(PermissionFlagsBits.ManageRoles)) {
          await interaction.reply({
            content: "You do not have permission to manage roles.",
            ephemeral: true,
          });
          return;
        }

        const highestRole = executor.roles.highest;
        if (role.position >= highestRole.position) {
          await interaction.reply({
            content:
              "You cannot manage roles higher than or equal to your highest role.",
            ephemeral: true,
          });
          return;
        }
      }

      if (role.position >= botMember.roles.highest.position) {
        await interaction.reply({
          content:
            "I cannot manage a role higher than or equal to my highest role.",
          ephemeral: true,
        });
        return;
      }

      if (action === "add") {
        if (member.roles.cache.has(role.id)) {
          await interaction.reply({
            content: `User ${targetUser.username} already has the role ${role.name}.`,
            ephemeral: true,
          });
          return;
        }

        await member.roles.add(role);
        await interaction.reply({
          content: `Role ${role.name} has been added to ${targetUser.username}.`,
          ephemeral: true,
        });
      } else if (action === "remove") {
        if (!member.roles.cache.has(role.id)) {
          await interaction.reply({
            content: `User ${targetUser.username} doesn't have the role ${role.name}.`,
            ephemeral: true,
          });
          return;
        }

        await member.roles.remove(role);
        await interaction.reply({
          content: `Role ${role.name} has been removed from ${targetUser.username}.`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(
        chalk.red("An error occurred while executing the role command:"),
        error
      );
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "An error occurred while managing the role.",
          ephemeral: true,
        });
      } else if (interaction.deferred) {
        await interaction.followUp({
          content: "An error occurred while managing the role.",
          ephemeral: true,
        });
      }
    }
  },
};
