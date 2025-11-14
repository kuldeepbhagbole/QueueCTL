import { getJobsByState, retryDlqJob } from '../lib/queue.js';
import Table from 'cli-table3';
import chalk from 'chalk';
import { truncate, formatDate } from '../utils/formatter.js';

export const dlqHandler = (action, id) => {
  if (action === 'list') {
    const jobs = getJobsByState('dead');
    if (jobs.length === 0) {
      console.log('DLQ is empty.');
      return;
    }
    
    const table = new Table({
      head: ['ID', 'Command', 'Error (Short)', 'Failed At'],
      colWidths: [10, 20, 30, 15] 
    });

    jobs.forEach(j => {
      table.push([
        j.id, 
        truncate(j.command, 15),        
        chalk.red(truncate(j.last_error, 25)), 
        formatDate(j.updated_at)        
      ]);
    });
    console.log(table.toString());

  } else if (action === 'retry') {
    if (!id) {
      console.log(chalk.red('Please provide job ID to retry.'));
      return;
    }
    const info = retryDlqJob(id);
    if (info.changes > 0) console.log(chalk.green(`Job ${id} moved back to pending.`));
    else console.log(chalk.red('Job not found in DLQ.'));
  }
};
