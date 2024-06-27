const { Events, EmbedBuilder, ActivityType } = require("discord.js");
const { readychannelId, ownerId } = require("../config/config.json");
const chalk = require("chalk");
const refreshSlash = require("../Updator/slashcommand.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    const channel = client.channels.cache.get(readychannelId);

    const serverCount = client.guilds.cache.size;
    const totalMembers = client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0
    );

    try {
      await refreshSlash();
      console.log(
        chalk.greenBright("Bot is now") +
          " " +
          chalk.cyanBright("LIVE and kicking!") +
          " " +
          chalk.magentaBright(`Logged in as ${client.user.tag}`)
      );
      const owner = await client.users.fetch(ownerId);

      const Rembed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("Bot is Operational! 🎉")
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        })
        .setImage(
          "https://cdn.discordapp.com/attachments/1242391176762622044/1251154820224778240/image0.gif?ex=666d8c3a&is=666c3aba&hm=b11384c024884ae12ca4904099c9add7149042e6a8c4ffc61af14e6f7e1628a5&"
        )
        .setDescription(`🚀 Ready to serve with style and efficiency!`)
        .addFields(
          { name: `🌐 Servers Online`, value: `${serverCount}`, inline: true },
          { name: `👥 Total Members`, value: `${totalMembers}`, inline: true }
        )
        .setTimestamp()
        .setFooter({
          text: `Crafted with 💖 by ${owner.globalName}`,
          iconURL: owner.displayAvatarURL(),
        });

      if (channel) {
        channel.send({ embeds: [Rembed] });
      } else {
        console.error(
          `Ready Channel with ID ${readychannelId} not found. Please check your configuration.`
        );
      }

      const presenceMessages = [
        { name: `🔥 Developed by ${owner.globalName}` },
        { name: `👥 Serving ${totalMembers} members` },
        { name: `🌐 Online in ${serverCount} servers` },
        { name: `🎉 Ready to serve!` },
        { name: `🤖 I'm ${client.user.username}` },
        { name: `🎮 Gaming with friends` },
        { name: `🎵 Jamming to tunes` },
        { name: `💡 Inspiring creativity` },
        { name: `📈 Boosting productivity` },
        { name: `⚡️ Supercharged with features` },
        { name: `🚀 Launching new ideas` },
        { name: `🎤 Listening to feedback` },
        { name: `🌟 Shining bright` },
        { name: `🛠️ Always improving` },
        { name: `📚 Learning new tricks` },
        { name: `💬 Chatting with users` },
        { name: `🏆 Achieving greatness` },
        { name: `🌍 Connecting communities` },
        { name: `🔍 Searching for updates` },
        { name: `🎨 Crafting cool stuff` },
        { name: `🔮 Exploring magical realms` },
        { name: `🦁 Proud Ravenclaw at heart` },
        { name: `🌙 Watching the stars` },
        { name: `🎒 Carrying my Quibbler` },
        { name: `✨ Believing in Nargles` },
        { name: `🦋 Searching for Wrackspurts` },
        { name: `🌸 Embracing uniqueness` },
        { name: `🌼 Spreading kindness` },
        { name: `📚 Learning spells and charms` },
        { name: `🌟 Being brave and bold` },
        { name: `🎨 Creating magical art` },
        { name: `🏰 Wandering Hogwarts` },
        { name: `🔍 Seeking the truth` },
        { name: `🧙‍♀️ Supporting friends` },
        { name: `🔭 Stargazing adventures` },
        { name: `🦉 Communicating with owls` },
        { name: `🌌 Dreaming of magical worlds` },
        { name: `🧵 Crafting unique outfits` },
        { name: `✨ Spreading magic and wonder` },
        { name: `🌟 Guiding the way with light` },
      ];

      const status = [
        { status: `online` },
        { status: `idle` },
        { status: `dnd` },
      ];
      // Function to update the bot's presence

      const updatePresence = () => {
        const randomIndex = Math.floor(Math.random() * presenceMessages.length);
        const presenceMessage = presenceMessages[randomIndex].name;

        const randemIndex2 = Math.floor(Math.random() * status.length);
        const statusMessage = status[randemIndex2].status;

        client.user.setPresence({
          activities: [
            {
              name: presenceMessage,
              type: ActivityType.Custom, // You can change this to LISTENING, PLAYING, etc.
            },
          ],
          status: statusMessage,
        });
      };

      // Set initial presence
      updatePresence();

      // Update presence every 15 seconds
      setInterval(updatePresence, 15000);
    } catch (error) {
      console.error("Uh-oh! Failed to refresh slash commands:", error);
    }
  },
};
