import { runCommand, makeJob } from './helper.js';
import chalk from 'chalk';

console.log(chalk.bold.blue('\n🧪 TEST 3: DLQ & Retry Logic'));

// 1. Setup: Failing Job bhejna
console.log(chalk.yellow('👉 Setup: Enqueuing a failing job...'));
runCommand(`queuectl enqueue ${makeJob("bad_command", "dlq-job-1")}`);

console.log(chalk.green('\n✅ Job Enqueued. Instructions:'));
console.log('1. Run worker: `queuectl worker --count 1`');
console.log('2. Wait for it to fail 3 times (check logs).');
console.log('3. Stop worker.');

console.log(chalk.yellow('\n👉 Action: Checking DLQ List...'));
runCommand('queuectl dlq list');

console.log(chalk.yellow('\n👉 Action: Retrying Job...'));
runCommand('queuectl dlq retry dlq-job-1');

console.log(chalk.green('\n✅ Verification: Run `queuectl list` to see if "dlq-job-1" is Pending again.'));