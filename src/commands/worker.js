import { exec } from 'child_process';
import { fetchNextJob, completeJob, failJob } from '../lib/queue.js';
import db from '../db/index.js'; // DB import kiya signal check karne ke liye
import chalk from 'chalk';

// 1. Check agar STOP signal active hai
const shouldStop = () => {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'worker_signal'").get();
  return row && row.value === 'STOP';
};

const runWorker = async (workerId) => {
  console.log(chalk.blue(`[Worker ${workerId}] Started`));
  
  let running = true;

  while (running) {
    // 2. Har loop mein check karo: Kya rukna hai?
    if (shouldStop()) {
      console.log(chalk.magenta(`[Worker ${workerId}] Stop signal received. Shutting down...`));
      running = false;
      break;
    }

    const job = fetchNextJob();

    if (!job) {
      // Wait 1 second if no jobs
      await new Promise(resolve => setTimeout(resolve, 1000));
      continue;
    }

    console.log(chalk.yellow(`[Worker ${workerId}] Processing Job ${job.id}: ${job.command}`));

    try {
      await new Promise((resolve, reject) => {
        exec(job.command, (error, stdout, stderr) => {
          if (error) reject(error);
          else resolve(stdout);
        });
      });

      completeJob(job.id);
      console.log(chalk.green(`[Worker ${workerId}] Job ${job.id} Completed`));
      
    } catch (err) {
      console.log(chalk.red(`[Worker ${workerId}] Job ${job.id} Failed`));
      failJob(job.id, err.message, job.attempts, job.max_retries || 3); // Use config or default 3
    }
  }
};

export const startWorkers = (count) => {
  // Start karte waqt signal ko RESET karo 'RUN' par
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('worker_signal', 'RUN')").run();

  const numWorkers = parseInt(count) || 1;
  console.log(chalk.green(`Starting ${numWorkers} workers...`));
  
  for (let i = 1; i <= numWorkers; i++) {
    runWorker(i);
  }
};

// 3. New Stop Function
export const stopWorkers = () => {
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('worker_signal', 'STOP')").run();
  console.log(chalk.magenta('🛑 Stop signal sent to all workers. They will finish current jobs and exit.'));
};