const { Events, EmbedBuilder } = require("discord.js");
const {
  guildJoinLog,
  specificGuildId,
  selfrolesChannelId,
  VerificationChannelId,
  rulesChannelId,
} = require("../config/config.json");
const gifs = require("../storage/welcomeGifs.json");
const chalk = require("chalk");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member, client) {
    // Check if the member object is valid
    if (!member) {
      console.log(chalk.redBright.bold("Invalid member object"));
      return;
    }

    // Ensure the event is triggered only for the specified guild
    if (member.guild.id !== specificGuildId) {
      return;
    }

    try {
      // Retrieve the log channel using the channel ID from the config
      const channel = await client.channels.fetch(guildJoinLog);
      if (!channel) throw new Error("Log channel not found");

      // Extract member details
      const guild = member.guild;
      const guildName = guild.name;
      const guildAvatar = guild.iconURL();
      const username = member.user.username;
      const discriminator = member.user.discriminator;
      const userId = member.user.id;
      const avatarURL = member.user.displayAvatarURL();
      const joinTime = member.joinedTimestamp;
      const accountCreationTime = member.user.createdTimestamp;

      //gifs
      const randomGifURL = gifs[Math.floor(Math.random() * gifs.length)];

      // Welcome  Description

      const Description =
        `○ Welcome to ${guildName}, [${username}#${discriminator}](${avatarURL}) 😇` +
        `○ Please take a moment to verify yourself in <#${VerificationChannelId}>,\n` +
        `○ Read the rules in <#${rulesChannelId}>,\n` +
        `○ And select your self roles in <#${selfrolesChannelId}>.\n\n` +
        `○ Enjoy your time here! 🎉`;

      // Log details to the console for debugging purposes
      console.log(
        chalk.greenBright(`New member joined: `) +
          chalk.magentaBright.bold.italic(`${username}#${discriminator}`) +
          chalk.greenBright.bold.italic(` (ID: ${userId})`)
      );

      console.log(
        chalk.greenBright(`Joined at: `) + chalk.yellowBright(joinTime)
      );
      console.log(
        chalk.greenBright(`Account created at: `) +
          chalk.yellow(accountCreationTime)
      );

      // Create an embed message with the member details
      const embed = new EmbedBuilder()
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        })
        .setColor("Green")
        .setTitle(`🎉 Welcome to the ${guildName}!  🎉`)
        .setURL(guildAvatar)
        .setDescription(Description)
        .addFields(
          {
            name: "Joined Server At",
            value: `<t:${Math.floor(joinTime / 1000)}:F>\n (<t:${Math.floor(
              joinTime / 1000
            )}:R>)`,
            inline: false,
          },
          {
            name: "Account Created At",
            value: `<t:${Math.floor(
              accountCreationTime / 1000
            )}:F>\n (<t:${Math.floor(accountCreationTime / 1000)}:R>)`,
            inline: false,
          }
        )
        .setImage(randomGifURL)
        .setTimestamp()
        .setFooter({
          text: `${username}`,
          iconURL: avatarURL,
        });

      // Send the embed message to the log channel
      await channel.send(`<@${userId}>`);
      await channel.send({ embeds: [embed] });
    } catch (error) {
      // Log any errors that occur during the process
      console.error(
        chalk.redBright.bold("Error logging member join event:"),
        chalk.whiteBright.bold(error)
      );
    }
  },
};
