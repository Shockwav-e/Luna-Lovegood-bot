const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription(
      "Get the number of users with a specified role and their details"
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role to get information about")
        .setRequired(true)
    ),
  async execute(interaction) {
    const role = interaction.options.getRole("role");

    if (!role) {
      await interaction.reply({
        content: "Please specify a valid role.",
        ephemeral: true,
      });
      return;
    }

    try {
      // Ensure the guild members are cached
      await interaction.guild.members.fetch();

      // Get all members with the role
      const allMembers = role.members;
      const totalMembers = allMembers.size;
      const botMembers = allMembers.filter((member) => member.user.bot).size;
      const humanMembers = totalMembers - botMembers;

      // Get the list of members with the role
      const memberList = allMembers.map((member) => member.user.tag).join(`\n`);

      const embed = new EmbedBuilder()

        .setAuthor({
          name: interaction.client.user.username,
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setColor(role.hexColor)
        .setTitle(`Role Information for ___${role.name}___`)
        .addFields(
          { name: "Role ID", value: role.id, inline: true },
          {
            name: "Total Members",
            value: `${totalMembers}`,
            inline: true,
          },
          {
            name: "Human Members",
            value: `${humanMembers}`,
            inline: true,
          },
          {
            name: "Bot Members",
            value: `${botMembers}`,
            inline: true,
          },
          {
            name: "Members",
            value: memberList || "No members with this role",
            inline: false,
          }
        )
        .setTimestamp()
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (error) {
      console.error(
        chalk.red("Error fetching role information: "),
        chalk.yellow(error)
      );
      await interaction.reply({
        content:
          "An error occurred while fetching the role information. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
