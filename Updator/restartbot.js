const { exec } = require("child_process");
const chalk = require("chalk");

async function restartbot() {
  const command = "node index"; // Replace with your actual restart command

  console.log(
    chalk.green("Restarting Bot ") + chalk.blue.bold.italic(`with: ${command}`)
  );

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Error executing command: ${error.message}`));
        reject(error);
        return;
      }
      if (stderr) {
        console.error(chalk.red(`Command stderr: ${stderr}`));
        reject(stderr);
        return;
      }
      console.log(chalk.greenBright(`${stdout}`));
      resolve(stdout.trim()); // Resolve with trimmed stdout
    });
  });
}

module.exports = restartbot;
