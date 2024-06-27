const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from the server.")
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to ban").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the ban")
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
          "I do not have permission to ban members. Please contact the server managers!",
        ephemeral: true,
      });
      return;
    }

    const targetMember = await interaction.guild.members.fetch(targetUser.id);

    if (targetUser.id === interaction.client.user.id) {
      await interaction.reply({
        content: "I cannot ban myself!",
        ephemeral: true,
      });
      return;
    }

    if (targetUser.id === interaction.user.id) {
      await interaction.reply({
        content: "You cannot ban yourself.",
        ephemeral: true,
      });
      return;
    }

    if (!targetMember.bannable) {
      await interaction.reply({
        content:
          "I cannot ban this user. They might have higher roles or I might lack permissions.",
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
          "You cannot ban a member with a role higher than or equal to your highest role.",
        ephemeral: true,
      });
      return;
    }

    if (
      targetMember.roles.highest.position >= botMember.roles.highest.position
    ) {
      await interaction.reply({
        content:
          "I cannot ban a member with a role higher than or equal to my highest role.",
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
        .setTitle(`You were banned from ${interaction.guild.name}`)
        .setDescription(reason)
        .addFields(
          { name: "Server Name", value: interaction.guild.name, inline: true },
          { name: "User Banned", value: targetUser.tag, inline: true }
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
      await targetMember.ban({ reason }); // Ensure reason is passed as an object property
      await interaction.followUp({
        content: `Successfully banned **${targetUser.tag}** for: **${reason}**.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(chalk.red(`Error banning the user: ${error}`));
      await interaction.followUp({
        content: "An error occurred while banning the user.",
        ephemeral: true,
      });
    }
  },
};
