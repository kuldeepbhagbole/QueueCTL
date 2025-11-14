import { runCommand } from './helper.js';
import chalk from 'chalk';

console.log(chalk.bold.blue('\n🧪 TEST 4: Configuration & Status Dashboard'));

// 1. Config Set Karna
console.log(chalk.yellow('👉 Action: Setting max-retries to 3...'));
runCommand('queuectl config set max_retries 3');

// 2. Verify Config
console.log(chalk.yellow('\n👉 Action: Verifying Config...'));
runCommand('queuectl config get');

// 3. Status Dashboard
console.log(chalk.yellow('\n👉 Action: Showing System Status...'));
runCommand('queuectl status');

console.log(chalk.green('\n✅ Expectation: Table should show current job counts.'));
