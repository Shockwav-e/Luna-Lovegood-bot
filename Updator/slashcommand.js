// deployCommands.js

const { exec } = require("child_process");
const chalk = require("chalk");

async function refreshSlash() {
  const command = "node deploy-commands"; // Replace with your actual deploy command

  console.log(
    chalk.green("Refreshing Bots Slash ") +
      chalk.blue.bold.italic(`Commands with: ${command}`)
  );

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(chalk.red(`Error executing command: ${error.message}`));
      return;
    }
    if (stderr) {
      console.error(chalk.red(`Command stderr: ${stderr}`));
      return;
    }
    console.log(chalk.greenBright(`${stdout}`));
  });
}

module.exports = refreshSlash;
