const { Events, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { guildCreatelog } = require("../config/config.json");
const chalk = require("chalk");

module.exports = {
  name: Events.GuildCreate,
  async execute(guild, client) {
    if (!guild) return;

    try {
      const channel = client.channels.cache.get(guildCreatelog);
      if (!channel) {
        console.error(
          chalk.redBright(`Log channel with ID ${guildCreatelog} not found`)
        );
        return;
      }

      const name = guild.name || "Unknown";
      const id = guild.id || "Unknown";
      const owner = await guild.members.fetch(guild.ownerId);
      const ownerName = owner.user.username || "Unknown";
      const ownerAvatar = owner.user.displayAvatarURL();
      const members = guild.memberCount || 0;
      const joinTime = guild.joinedAt || new Date();
      const guildIcon = guild.iconURL();

      const botMember = await guild.members.fetch(client.user.id);

      const textChannels = guild.channels.cache.filter(
        (c) =>
          c.isTextBased() &&
          c
            .permissionsFor(botMember)
            .has(PermissionsBitField.Flags.CreateInstantInvite)
      );

      if (textChannels.size === 0) {
        console.error(
          chalk.redBright(
            `No text channels found with CREATE_INSTANT_INVITE permission in guild ${name}`
          )
        );
        return;
      }

      const inviteChannel = textChannels.first();
      const invite = await inviteChannel.createInvite({
        maxAge: 0,
        maxUses: 0,
      });

      const logMessage =
        chalk.greenBright("Joined a new guild:") +
        `\n` +
        chalk.blueBright("Name: ") +
        chalk.yellowBright.bold.italic(name) +
        `\n` +
        chalk.blueBright("ID: ") +
        chalk.redBright(id) +
        `\n` +
        chalk.blueBright("Total Members: ") +
        chalk.cyanBright.bold.italic(members) +
        `\n` +
        chalk.blueBright("Owner Name: ") +
        chalk.magentaBright.bold.italic(ownerName) +
        `\n` +
        chalk.blueBright("Joined at: ") +
        chalk.greenBright(joinTime);

      const embed = new EmbedBuilder()
        .setColor("#03ff01")
        .setTitle("Bot was Added to a New Server!")
        .setURL(invite.url)
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        })
        .setThumbnail(guildIcon)
        .addFields(
          { name: "Name", value: name, inline: true },
          { name: "ID", value: id, inline: true },
          {
            name: "Total Members",
            value: members.toString(),
            inline: true,
          },
          {
            name: "Owner",
            value: `[${ownerName}](${ownerAvatar})`,
            inline: true,
          },
          {
            name: "Joined at",
            value: joinTime.toString(),
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({ text: "Made By Shockwave9999" });

      console.log(logMessage);
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Error executing GuildCreate event: ${error.message}`);
    }
  },
};
