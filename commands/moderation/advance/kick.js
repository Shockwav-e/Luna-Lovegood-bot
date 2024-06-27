const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the kick")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("attachment")
        .setDescription("Attachment")
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
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    if (!targetUser) {
      await interaction.reply({
        content: "Please specify a valid user.",
        ephemeral: true,
      });
      return;
    }

    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      await interaction.reply({
        content: "You do not have permission to use this command!",
        ephemeral: true,
      });
      return;
    }

    const botMember = await interaction.guild.members.fetch(
      interaction.client.user.id
    );
    if (!botMember.permissions.has(PermissionFlagsBits.KickMembers)) {
      await interaction.reply({
        content:
          "I do not have permission to kick members. Please contact the server managers!",
        ephemeral: true,
      });
      return;
    }

    const targetMember = await interaction.guild.members.fetch(targetUser.id);

    if (targetUser.id === interaction.client.user.id) {
      await interaction.reply({
        content: "I cannot kick myself !",
        ephemeral: true,
      });
      return;
    }

    if (targetUser.id === interaction.user.id) {
      await interaction.reply({
        content:
          "You cannot kick yourself. Please try leaving the server instead.",
        ephemeral: true,
      });
      return;
    }

    if (!targetMember.kickable) {
      await interaction.reply({
        content:
          "I cannot kick this user. They might have higher roles or I might lack permissions.",
        ephemeral: true,
      });
      return;
    }

    // Check if the executor's highest role is above the target member's highest role
    if (
      targetMember.roles.highest.position >=
      interaction.member.roles.highest.position
    ) {
      await interaction.reply({
        content:
          "You cannot kick a member with a role higher than or equal to your highest role.",
        ephemeral: true,
      });
      return;
    }

    // Check if the bot's highest role is above the target member's highest role
    if (
      targetMember.roles.highest.position >= botMember.roles.highest.position
    ) {
      await interaction.reply({
        content:
          "I cannot kick a member with a role higher than or equal to my highest role.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const attachment = interaction.options.getAttachment("attachment");

    try {
      const dmEmbed = new EmbedBuilder()
        .setAuthor({
          name: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        })
        .setColor("Red")
        .setTitle(`You were kicked from ${interaction.guild.name}`)
        .setDescription(reason)
        .addFields(
          { name: "Server Name", value: interaction.guild.name, inline: true },
          { name: "User Kicked", value: targetUser.tag, inline: true }
        )
        .setFooter({
          text: targetUser.tag,
          iconURL: targetUser.displayAvatarURL(),
        })
        .setTimestamp();

      if (attachment) {
        dmEmbed.setImage(attachment.url);
      }

      await targetMember.send({ embeds: [dmEmbed] });
    } catch (error) {
      console.warn(
        chalk.yellow(`Could not send DM to ${targetUser.tag}: ${error.message}`)
      );
    }

    try {
      // Kick the user
      await targetMember.kick(reason);
      await interaction.followUp({
        content: `Successfully kicked **${targetUser.tag}** for: **${reason}**`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(chalk.red(`Error kicking the user: ${error}`));
      await interaction.followUp({
        content: "An error occurred while kicking the user.",
        ephemeral: true,
      });
    }
  },
};
