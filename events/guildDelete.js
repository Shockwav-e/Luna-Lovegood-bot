const { Events, EmbedBuilder } = require("discord.js");
const { guildDeletelog } = require("../config/config.json");
const chalk = require("chalk");

module.exports = {
  name: Events.GuildDelete,
  async execute(guild, client) {
    // Check if the guild object is valid
    if (!guild) return;

    try {
      // Retrieve the log channel using the channel ID from the config
      const channel = client.channels.cache.get(guildDeletelog);
      if (!channel) throw new Error("Log channel not found");

      // Extract guild details
      const name = guild.name;
      const id = guild.id;
      const guildIcon = guild.iconURL();
      const members = guild.memberCount;
      const leaveTime = new Date();

      // Log details to the console for debugging purposes
      console.log(
        chalk.redBright("Left a guild:"),
        chalk.yellowBright.bold.italic(`${name}`)
      );
      console.log(chalk.redBright("ID:"), chalk.magentaBright.bold(` ${id}`));
      console.log(
        chalk.redBright("Total Members:"),
        chalk.cyanBright.bold.italic(`${members}`)
      );
      console.log(
        chalk.redBright("Left at:"),
        chalk.greenBright.bold.italic(`${leaveTime}`)
      );

      // Create an embed message with the guild details
      const embed = new EmbedBuilder()
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setTitle("Bot was Removed from a Server!")
        .setThumbnail(guildIcon)
        .addFields(
          { name: "Name", value: name, inline: true },
          { name: "ID", value: id, inline: true },
          {
            name: "Total Members",
            value: members.toString(),
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({ text: "Made By Shockwave9999" });

      // Send the embed message to the log channel
      await channel.send({ embeds: [embed] });
    } catch (error) {
      // Log any errors that occur during the process
      console.error(chalk.redBright("Error logging guild leave event:", error));
    }
  },
};
