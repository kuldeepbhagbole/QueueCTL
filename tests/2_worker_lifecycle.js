import { runCommand, makeJob } from './helper.js';
import chalk from 'chalk';

console.log(chalk.bold.blue('\n🧪 TEST 2: Worker Lifecycle (Start/Stop)'));

// 1. Setup: 3 Lambe jobs bhejna
console.log(chalk.yellow('👉 Setup: Enqueuing 3 long-running jobs...'));
for(let i=1; i<=3; i++) {
  runCommand(`queuectl enqueue ${makeJob("timeout 5", `worker-test-${i}`)}`);
}

console.log(chalk.green('\n✅ Setup Complete. Now perform these Manual Steps:'));
console.log(chalk.white('1. Open a new terminal.'));
console.log(chalk.cyan('2. Run: queuectl worker start --count 3'));
console.log(chalk.white('   (You should see 3 workers starting)'));
console.log(chalk.cyan('3. Run: queuectl worker stop'));
console.log(chalk.white('   (Workers should finish current job and exit gracefully)'));