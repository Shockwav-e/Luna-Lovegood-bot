const { Events, EmbedBuilder } = require("discord.js");
const {
  guildLeaveLog,
  specificGuildId,
  inviteLink,
} = require("../config/config.json");
const gifs = require("../storage/goodbyeGifs.json");
const chalk = require("chalk");

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member, client) {
    // Check if the member object is valid
    if (!member) {
      console.log(
        chalk.bold.red("Invalid") + " " + chalk.bold.yellow("member object")
      );

      return;
    }

    // Ensure the event is triggered only for the specified guild
    if (member.guild.id !== specificGuildId) {
      return;
    }

    try {
      // Retrieve the log channel using the channel ID from the config
      const channel = await client.channels.fetch(guildLeaveLog);
      if (!channel) throw new Error("Log channel not found");

      const randomGifURL = gifs[Math.floor(Math.random() * gifs.length)];

      // Extract member details
      const username = member.user.username;
      const discriminator = member.user.discriminator;
      const userId = member.user.id;
      const avatarURL = member.user.displayAvatarURL();

      // Log details to the console for debugging purposes
      console.log(
        chalk.redBright("Member left: ") +
          chalk.cyanBright(`${username}#${discriminator}`) +
          chalk.yellowBright(` (ID: ${userId})`)
      );

      // Create a simple embed message with the member details
      const embed = new EmbedBuilder()
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setTitle("😢 Member Left")
        .setURL(avatarURL)
        .setThumbnail(avatarURL)
        .setImage(randomGifURL)
        .setDescription(
          `**Goodbye ${username}, we'll miss you!**\n\nWe're sad to see you go. If you ever decide to come back, our doors are always open. 😊`
        )

        .addFields({
          name: "Username",
          value: `${username}#${discriminator}\ ${userId} `,
          inline: true,
        })
        .setTimestamp()
        .setFooter({
          text: "Made By Shockwave9999",
          iconURL: client.user.displayAvatarURL(),
        });

      // Send the embed message to the log channel
      await channel.send({ embeds: [embed] });
      try {
        await member.user.send(
          `We're sad to see you go from [${member.guild.name}](${inviteLink}), ${username}. If you ever decide to come back, our doors are always open. 😊`
        );
        console.log(
          chalk.greenBright("Sent a goodbye message to ") +
            chalk.yellowBright(username)
        );
      } catch (dmError) {
        console.error(
          chalk.redBright("Could not send a DM to ") +
            chalk.yellowBright(username) +
            chalk.redBright(", maybe dms are off?")
        );
      }
    } catch (error) {
      // Log any errors that occur during the process
      console.error(
        chalk.redBright("Error logging member leave event:"),
        chalk.whiteBright.bold(error)
      );
    }
  },
};
