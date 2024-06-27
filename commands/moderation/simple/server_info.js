const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server_info")
    .setDescription("Get information about the server"),
  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    try {
      const { guild } = interaction;

      // Fetch the guild owner
      const owner = await guild.fetchOwner();

      // Ensure the guild members are cached
      await guild.members.fetch();

      // Get the number of members
      const totalMembers = guild.memberCount;

      // Get the number of bots
      const botMembers = guild.members.cache.filter(
        (member) => member.user.bot
      ).size;

      // Get the number of human members
      const humanMembers = totalMembers - botMembers;

      // Get the number of roles
      const totalRoles = guild.roles.cache.size;

      // Get the number of channels by type
      const totalTextChannels = guild.channels.cache.filter(
        (channel) => channel.type === 0
      ).size; // 0: GUILD_TEXT
      const totalVoiceChannels = guild.channels.cache.filter(
        (channel) => channel.type === 2
      ).size; // 2: GUILD_VOICE
      const totalCategories = guild.channels.cache.filter(
        (channel) => channel.type === 4
      ).size; // 4: GUILD_CATEGORY

      // Get emoji counts
      const totalEmojis = guild.emojis.cache.size;
      const animatedEmojis = guild.emojis.cache.filter(
        (emoji) => emoji.animated
      ).size;
      const staticEmojis = totalEmojis - animatedEmojis;

      // Get boost information
      const boostLevel = guild.premiumTier;
      const boostCount = guild.premiumSubscriptionCount;
      const boosters = guild.members.cache.filter(
        (member) => member.premiumSince
      ).size;

      const embed = new EmbedBuilder()
        .setAuthor({
          name: guild.name,
          iconURL: guild.iconURL(),
        })
        .setColor("Gold")
        .setTitle(`Server Information for ___${guild.name}___`)
        .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
        .addFields(
          {
            name: "Server Name",
            value: `[${guild.name}](${guild.iconURL()})`,
            inline: true,
          },
          { name: "Server ID", value: guild.id, inline: true },

          {
            name: "Owner",
            value: `<@${owner.id}>`,
            inline: true,
          },
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
            name: "Total Roles",
            value: `${totalRoles}`,
            inline: true,
          },
          {
            name: "Text Channels",
            value: `${totalTextChannels}`,
            inline: true,
          },
          {
            name: "Voice Channels",
            value: `${totalVoiceChannels}`,
            inline: true,
          },
          {
            name: "Categories",
            value: `${totalCategories}`,
            inline: true,
          },
          {
            name: "Total Emojis",
            value: `${totalEmojis}`,
            inline: true,
          },
          {
            name: "Animated Emojis",
            value: `${animatedEmojis}`,
            inline: true,
          },
          {
            name: "Static Emojis",
            value: `${staticEmojis}`,
            inline: true,
          },
          {
            name: "Boost Level",
            value: `${boostLevel}`,
            inline: true,
          },
          {
            name: "Boost Count",
            value: `${boostCount}`,
            inline: true,
          },
          { name: "Boosters", value: `${boosters}`, inline: true },
          {
            name: "Creation Date",
            value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      // Add the server banner if available
      if (guild.bannerURL()) {
        embed.setImage(guild.bannerURL({ size: 512 }));
      }

      await interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (error) {
      console.error(
        chalk.red("Error fetching server information: "),
        chalk.yellow(error)
      );
      await interaction.reply({
        content:
          "An error occurred while fetching the server information. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
