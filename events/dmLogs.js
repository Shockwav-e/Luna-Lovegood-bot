const { WebhookClient } = require("discord.js");
const { dmLogChannelId } = require("../config/config.json");
const chalk = require("chalk");

module.exports = {
  name: "messageCreate", // Change to string value "messageCreate"
  async execute(message, client) {
    try {
      // Check if the message is a DM sent to the bot by someone else
      if (message.channel.type === 1 && message.author.id !== client.user.id) {
        // Log the content of the DM
        console.log(
          chalk.magentaBright(
            `${message.author.username}`,
            chalk.greenBright(`said`),
            chalk.whiteBright(`${message.content}`)
          )
        );

        // Log the attachments if any
        if (message.attachments.size > 0) {
          message.attachments.forEach((attachment) => {
            console.log(
              chalk.magentaBright(
                `${message.author.username}`,
                chalk.greenBright(`sent an attachment:`),
                chalk.blueBright(`${attachment.url}`)
              )
            );
          });
        }

        // Sanitize the message content to prevent @here and @everyone tags
        const sanitizedContent = message.content.replace(/@/g, "＠");

        // Get the webhook channel
        const webhookChannel = client.channels.cache.get(dmLogChannelId);

        // Check if the webhook channel exists
        if (webhookChannel) {
          // Create webhook
          const webhook = await webhookChannel.createWebhook({
            name: message.author.globalName || message.author.username,
            avatar: message.author.displayAvatarURL(),
          });

          // Send message via webhook
          await webhook.send({
            content: sanitizedContent,
            files: message.attachments.map((attachment) => attachment.url),
          });

          // Delete webhook
          await webhook.delete("DM message logged"); // Provide a reason for deletion
        } else {
          console.log(chalk.redBright("Webhook channel not found."));
        }

        // Handle the DM further if needed
        // You can add your custom logic here
      }
    } catch (error) {
      console.error(chalk.redBright("Error processing message:", error));
    }
  },
};
