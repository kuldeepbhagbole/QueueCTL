import db from '../db/index.js';
import Table from 'cli-table3';
import chalk from 'chalk';

export const showStatus = () => {
  // 1. Count jobs by state
  const stats = db.prepare(`
    SELECT state, COUNT(*) as count FROM jobs GROUP BY state
  `).all();

  // 2. Format data for table
  const summary = { pending: 0, processing: 0, completed: 0, failed: 0, dead: 0 };
  stats.forEach(s => summary[s.state] = s.count);

  const table = new Table({
    head: [chalk.cyan('State'), chalk.cyan('Count')],
    colWidths: [20, 10]
  });

  table.push(
    ['Pending ⏳', summary.pending],
    ['Processing ⚙️', summary.processing],
    ['Completed ✅', chalk.green(summary.completed)],
    ['Failed ⚠️', chalk.yellow(summary.failed)],
    ['Dead (DLQ) 💀', chalk.red(summary.dead)]
  );

  console.log(chalk.bold('\n📊 System Status'));
  console.log(table.toString());
  console.log(`Total Jobs: ${Object.values(summary).reduce((a, b) => a + b, 0)}\n`);
};