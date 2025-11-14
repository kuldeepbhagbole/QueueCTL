// tests/helper.js
import { execSync } from 'child_process';

export const runCommand = (cmd) => {
  try {
    console.log(`Running: ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    // Ignore errors specifically for DLQ/Fail tests
  }
};

export const makeJob = (cmd, id) => {
  const json = JSON.stringify({ command: cmd, id: id });
  // Windows needs double quotes escaped
  if (process.platform === 'win32') return `"${json.replace(/"/g, '\\"')}"`;
  return `'${json}'`; // Mac/Linux
};