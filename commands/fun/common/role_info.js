const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role_info")
    .setDescription("Get information about a specified role")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role to get information about")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const role = interaction.options.getRole("role");

      if (!role) {
        await interaction.reply({
          content: "Please specify a valid role.",
          ephemeral: true,
        });
        return;
      }

      // Ensure the guild members are cached
      await interaction.guild.members.fetch();

      // Get all members with the role
      const allMembers = role.members;
      const totalMembers = allMembers.size;
      const botMembers = allMembers.filter((member) => member.user.bot).size;
      const humanMembers = totalMembers - botMembers;

      // Fetching permissions in a human-readable format
      const permissions =
        role.permissions
          .toArray()
          .map((perm) => {
            const permName = Object.keys(PermissionsBitField.Flags).find(
              (key) =>
                PermissionsBitField.Flags[key] ===
                PermissionsBitField.Flags[perm]
            );
            return permName
              ? permName
                  .replace(/_/g, " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (char) => char.toUpperCase())
              : perm;
          })
          .join(", ") || "No permissions";

      const roleInfo = {
        name: role.name,
        id: role.id,
        color: role.hexColor,
        createdAt: role.createdAt.toDateString(),
        totalMembers: totalMembers,
        humanMembers: humanMembers,
        botMembers: botMembers,
        permissions: permissions,
      };

      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.client.user.username,
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setColor(role.hexColor)
        .setTitle(`Role Information for: ___${roleInfo.name}___`)
        .addFields(
          { name: "Role ID", value: roleInfo.id, inline: true },
          { name: "Color", value: roleInfo.color, inline: true },
          {
            name: "Created On",
            value: roleInfo.createdAt,
            inline: true,
          },
          {
            name: "Total Members",
            value: `${roleInfo.totalMembers}`,
            inline: true,
          },
          {
            name: "Human Members",
            value: `${roleInfo.humanMembers}`,
            inline: true,
          },
          {
            name: "Bot Members",
            value: `${roleInfo.botMembers}`,
            inline: true,
          },
          {
            name: "Permissions",
            value: roleInfo.permissions,
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

      // Enhanced error handling
      let errorMessage =
        "An error occurred while fetching the role information. Please try again later.";
      if (error.message.includes("Missing Access")) {
        errorMessage =
          "The bot lacks the necessary permissions to fetch this information. Please ensure it has the required permissions.";
      }

      await interaction.reply({
        content: errorMessage,
        ephemeral: true,
      });
    }
  },
};
