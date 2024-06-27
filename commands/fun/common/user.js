const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Get information about a specified user")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to get information about")
        .setRequired(true)
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser("target");

    if (!targetUser) {
      await interaction.reply({
        content: "Please specify a valid user.",
        ephemeral: true,
      });
      return;
    }

    let member;
    try {
      member = await interaction.guild.members.fetch(targetUser.id);
    } catch (error) {
      console.error(
        chalk.red("Error fetching guild member:"),
        chalk.yellow(error)
      );
    }

    try {
      await targetUser.fetch();
    } catch (error) {
      console.error(
        chalk.red("Error fetching user data:"),
        chalk.yellow(error)
      );
    }

    const userInfo = {
      username: targetUser.username,
      globalName: targetUser.globalName,
      discriminator: targetUser.discriminator,
      id: targetUser.id,
      avatar: targetUser.displayAvatarURL({ dynamic: true, size: 512 }),
      banner: targetUser.bannerURL({ dynamic: true, size: 512 }),
      createdAt: Math.floor(targetUser.createdAt.getTime() / 1000),
      roles: member
        ? member.roles.cache
            .filter((role) => role.name !== "@everyone")
            .map((role) => role.name)
        : [],
    };

    userInfo.rolesDisplay =
      userInfo.roles.length > 5
        ? userInfo.roles.slice(0, 5).join(", ") + ", more..."
        : userInfo.roles.join(", ") || "No roles";

    const isBooster = member ? member.premiumSince !== null : false;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.client.user.username,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setDescription(`<@${userInfo.id}>`)
      .setColor("Gold")
      .setTitle(
        `User Information for **${userInfo.username}#${userInfo.discriminator}**`
      )
      .setThumbnail(userInfo.avatar)
      .addFields(
        {
          name: "Global Name",
          value: userInfo.globalName || userInfo.username,
          inline: false,
        },
        { name: "User Name", value: userInfo.username, inline: false },
        { name: "User ID", value: userInfo.id, inline: false },
        {
          name: "Avatar",
          value: `[Click Here](${userInfo.avatar})`,
          inline: true,
        },
        {
          name: "Account Created",
          value: `<t:${userInfo.createdAt}:F>`,
          inline: false,
        },
        member
          ? {
              name: "Joined Server",
              value: `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>`,
              inline: false,
            }
          : {
              name: "Joined Server",
              value: "Not a member",
              inline: false,
            },
        { name: "Roles", value: userInfo.rolesDisplay, inline: false },
        {
          name: "Server Booster",
          value: isBooster ? "Yes" : "No",
          inline: true,
        }
      )
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    if (userInfo.banner) {
      embed.setImage(userInfo.banner);
      embed.addFields({
        name: `Banner`,
        value: `[Click Here](${userInfo.banner})`,
        inline: true,
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
