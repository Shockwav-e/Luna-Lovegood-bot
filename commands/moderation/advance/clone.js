const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clone")
    .setDescription(
      "Delete the current channel and create a new channel with the same settings."
    ),

  async execute(interaction) {
    try {
      if (!interaction.guild) {
        await interaction.reply({
          content: "This command must be used in a server.",
          ephemeral: true,
        });
        return;
      }

      if (
        !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)
      ) {
        await interaction.reply({
          content: "You do not have permission to use this command!",
          ephemeral: true,
        });
        return;
      }

      const botMember = await interaction.guild.members.fetch(
        interaction.client.user.id
      );
      if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
        await interaction.reply({
          content:
            "I do not have permission to manage channels. Please contact the server managers!",
          ephemeral: true,
        });
        return;
      }

      const channel = interaction.channel;

      const confirm = new ButtonBuilder()
        .setCustomId("confirm")
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Danger)
        .setEmoji(`✅`);

      const cancel = new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(`❌`);

      const row = new ActionRowBuilder().addComponents(cancel, confirm);

      const lefttime = Math.floor((Date.now() + 16000) / 1000);

      const time = `<t:${lefttime}:R>`;

      await interaction.reply({
        content: `Are you sure you want to clone this channel❓ 
This action cannot be undone and will delete the current channel.
(Buttons will be disabled in ${time})
`,
        components: [row],
      });

      const filter = (i) => i.customId === "confirm" || i.customId === "cancel";
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 15000,
      });

      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
          await i.reply({
            content:
              "Only the user who initiated the command can interact with the buttons.",
            ephemeral: true,
          });
          return;
        }

        if (i.customId === "confirm") {
          await interaction.delete;

          // Clone the current channel
          const newChannel = await channel.clone();

          // Move the new channel to the same position as the old one
          await newChannel.setPosition(channel.position);

          // Delete the old channel
          await channel.delete();

          // Send a message in the new channel
          await newChannel.send({
            content: `Channel has been cloned successfully! This is the new channel.`,
          });
        } else if (i.customId === "cancel") {
          await i.update({ content: "Cloning canceled.", components: [] });
        }
      });

      collector.on("end", async (collected) => {
        if (collected.size === 0) {
          // Disable buttons by updating their properties
          confirm.setDisabled(true);
          cancel.setDisabled(true);

          // Edit the interaction reply to show the message with disabled buttons
          await interaction
            .editReply({
              content: "Cloning timed out. Please try again.",
              components: [row.toJSON()], // Row with disabled buttons
            })
            .catch((error) =>
              console.error("Failed to edit interaction:", error)
            );
        }
      });
    } catch (error) {
      console.error(chalk.red(`Error cloning channel: ${error}`));

      // Handle errors that might occur after the interaction is deferred
      try {
        await interaction.followUp({
          content: "An error occurred while cloning the channel.",
          ephemeral: true,
        });
      } catch (interactionError) {
        console.error(
          chalk.red(
            `Error sending follow-up interaction reply: ${interactionError}`
          )
        );
      }
    }
  },
};
