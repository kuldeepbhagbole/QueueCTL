import { addJob } from '../lib/queue.js';
import chalk from 'chalk';

export const enqueue = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.command) throw new Error('Command is required');
    
    const id = addJob(data.command, data.id);
    console.log(chalk.green(`Job enqueued successfully. ID: ${id}`));
  } catch (e) {
    console.error(chalk.red('Error parsing JSON or adding job:'), e.message);
  }
};