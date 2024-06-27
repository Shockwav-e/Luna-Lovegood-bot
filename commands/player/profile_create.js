const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const { profileChannel } = require(`../../config/config.json`);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile_create")
    .setDescription("Create a Profile for your Modern Warships Game.")
    .addStringOption((option) =>
      option
        .setName("ingame_name")
        .setDescription("Your Game Name")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("ingame_id")
        .setDescription("Your Game ID")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Your Game Title")
        .setRequired(true)
        .addChoices(
          { name: "Hero", value: "Hero" },
          { name: "Legendary", value: "Legendary" },
          { name: "None", value: "None" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("profile_screenshot_url")
        .setDescription("URL of your Profile Screenshot")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("about")
        .setDescription("A Short About Me")
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }).catch(console.error);
    const client = interaction.client;

    try {
      const user = interaction.user;
      const name = interaction.options.getString("ingame_name");
      const id = interaction.options.getString("ingame_id");
      const title = interaction.options.getString("title");
      const screenshot = interaction.options.getString(
        "profile_screenshot_url"
      );
      const about =
        interaction.options.getString("about") || "No information provided";

      const profilesFolder = path.join(
        __dirname,
        "..",
        "..",
        "database",
        "profiles"
      );
      if (!fs.existsSync(profilesFolder)) {
        fs.mkdirSync(profilesFolder, { recursive: true });
      }

      // Check if user already registered
      const files = fs.readdirSync(profilesFolder);
      for (const file of files) {
        const profile = JSON.parse(
          fs.readFileSync(path.join(profilesFolder, file), "utf-8")
        );
        if (profile.userId === user.id || profile.ingameId === id) {
          return await interaction.editReply(
            "You have already registered a profile or this Game ID is already in use."
          );
        }
      }

      const embed = new EmbedBuilder()
        .setAuthor({
          name: user.globalName || user.username,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setTitle("Profile Created")
        .setDescription(
          `Your profile has been created.\n<@${user.id}> (${user.username})`
        )
        .addFields(
          { name: "InGame Name", value: name, inline: true },
          { name: "InGame ID", value: id, inline: true },
          { name: "Title", value: title, inline: true },

          {
            name: "Profile Screenshot",
            value: `[Click Here](${screenshot})`,
            inline: false,
          },
          { name: "About", value: about, inline: false }
        )
        .setImage(screenshot)
        .setColor("Green")
        .setTimestamp()
        .setFooter({
          text: `Requested by ${user.globalName || user.username}`,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        });

      const channel = client.channels.cache.get(profileChannel);
      if (channel) {
        await channel.send(
          `This is Image of ${user.username}'s (${user.id}) profile [screenshot](${screenshot})`
        );
      } else {
        console.error(`Failed to find channel with ID ${profileChannel}`);
      }

      const profileData = {
        userId: user.id,
        username: user.username,
        ingameName: name,
        ingameId: id,
        title: title,
        about: about,
        screenshotUrl: screenshot,
        timestamp: new Date().toISOString(),
      };

      const filename = `${user.id}_${user.username}.json`;
      const filePath = path.join(profilesFolder, filename);

      fs.writeFileSync(filePath, JSON.stringify(profileData, null, 2));

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(
        chalk.red(
          "An error occurred while executing the profile create command:"
        ),
        chalk.red(error)
      );

      const errorMessage =
        "An error occurred while creating your profile. Please try again later.";

      await interaction
        .editReply({ content: errorMessage })
        .catch(async (editError) => {
          console.error(
            chalk.yellow("Failed to edit reply:"),
            chalk.yellow(editError)
          );
          if (interaction.replied || interaction.deferred) {
            await interaction
              .followUp({ content: errorMessage, ephemeral: true })
              .catch(console.error);
          } else {
            await interaction
              .reply({ content: errorMessage, ephemeral: true })
              .catch(console.error);
          }
        });
    }
  },
};
