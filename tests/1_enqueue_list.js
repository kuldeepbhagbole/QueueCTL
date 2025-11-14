import { runCommand, makeJob } from './helper.js';
import chalk from 'chalk';

console.log(chalk.bold.blue('\n🧪 TEST 1: Enqueue & List Jobs'));

// 1. Job Enqueue Karna (Example: sleep 2)
const payload = makeJob("timeout 2", "job1"); // Windows me 'timeout', Mac me 'sleep'
console.log(chalk.yellow('👉 Action: Enqueuing job...'));
runCommand(`queuectl enqueue ${payload}`);

// 2. List Check Karna (Sirf Pending wale)
console.log(chalk.yellow('\n👉 Action: Listing PENDING jobs...'));
runCommand('queuectl list --state pending');

console.log(chalk.green('\n✅ Expectation: "job1" should be visible in the list above.'));