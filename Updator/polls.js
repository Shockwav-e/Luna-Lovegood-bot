// deployCommands.js

const { exec } = require("child_process");

async function deployCommands() {
  const command = "node deploy-commands"; // Replace with your actual deploy command
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
      return;
    }
  });
}

module.exports = deployCommands;
