import { getJobsByState } from '../lib/queue.js';
import Table from 'cli-table3';
import { formatDate, truncate } from '../utils/formatter.js'; 

export const listJobs = (options) => {
  const jobs = getJobsByState(options.state);
  
  const table = new Table({
    head: ['ID', 'Command', 'State', 'Attempts', 'Next Run'],
    colWidths: [10, 20, 12, 10, 20] 
  });

  jobs.forEach(job => {
    table.push([
      job.id, 
      truncate(job.command, 25),     
      job.state, 
      job.attempts, 
      formatDate(job.next_run_at)    
    ]);
  });

  console.log(table.toString());
};