const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const { version } = require("../../package.json");
const { ownerId, inviteLink } = require("../../config/config.json");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("about")
    .setDescription("Displays information about the bot"),
  async execute(interaction) {
    try {
      const { client } = interaction;

      // Bot information
      const botName = client.user.username;
      const botId = client.user.id;
      const creationDate = client.user.createdAt.toDateString();
      const serverCount = client.guilds.cache.size;
      const uptime = process.uptime(); // Bot uptime in seconds
      const memoryUsage = process.memoryUsage().heapUsed / (1024 * 1024); // Memory usage in MB
      const platform = os.platform();
      const nodeVersion = process.version;

      // Convert uptime to a more readable format
      const uptimeSeconds = Math.floor(uptime % 60);
      const uptimeMinutes = Math.floor((uptime / 60) % 60);
      const uptimeHours = Math.floor((uptime / 3600) % 24);
      const uptimeDays = Math.floor(uptime / (3600 * 24));

      const uptimeString = `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`;
      const owner = interaction.client.users.cache.get(ownerId);

      // Create an embed
      const botInfoEmbed = new EmbedBuilder()
        .setAuthor({
          name: owner.globalName,
          iconURL: owner.displayAvatarURL(),
        })
        .setColor(`Gold`)
        .setTitle(`About **${botName}**`)
        .setURL(client.user.displayAvatarURL())
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription(
          `This Bot is created by ${owner} with 💖 for [Shockwave's Paradise](${inviteLink}) Server.`
        )
        .addFields(
          {
            name: "<:nametag:1252483257703075941> Name",
            value: botName,
            inline: true,
          },
          { name: ":identification_card: ID", value: botId, inline: true },
          { name: "🗓️ Created On", value: creationDate, inline: true },
          {
            name: "<a:Developer:1252482268555907186> Created By",
            value: `<@${ownerId}>`,
            inline: true,
          },
          {
            name: "<:channels:1063113372264054816> Servers",
            value: `${serverCount}`,
            inline: true,
          },
          {
            name: "<a:uptime:1252481170671665172> Uptime",
            value: uptimeString,
            inline: true,
          },
          {
            name: "<:ram2:1063112977273860116> Memory Usage",
            value: `${memoryUsage.toFixed(2)} MB`,
            inline: true,
          },
          {
            name: "<:linux:1252474622583115867> Platform",
            value: platform,
            inline: true,
          },
          {
            name: "<a:nodejs:1252475056702099556> Node.js Version",
            value: nodeVersion,
            inline: true,
          },
          {
            name: "<a:Version:1252473764390768701> Bot Version",
            value: version,
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });
      await interaction.reply({ embeds: [botInfoEmbed] });
    } catch (error) {
      console.error(
        "An error occurred while executing the botinfo command:",
        error
      );
      await interaction.reply({
        content: "An error occurred while processing the command.",
        ephemeral: true,
      });
    }
  },
};
