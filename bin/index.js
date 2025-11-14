#!/usr/bin/env node

import { Command } from 'commander';
import { enqueue } from '../src/commands/enqueue.js';
import { startWorkers,stopWorkers } from '../src/commands/worker.js';
import { listJobs } from '../src/commands/list.js';
import { dlqHandler } from '../src/commands/dlq.js';
import { showStatus } from '../src/commands/status.js';
import { configHandler } from '../src/commands/config.js';

const program = new Command();

program
  .name('queuectl')
  .description('CLI-based background job queue system')
  .version('1.0.0');

program
  .command('enqueue <json>')
  .description('Enqueue a job. Ex: \'{"command": "echo hello"}\'')
  .action(enqueue);

const workerCommand = program.command('worker').description('Manage workers');
workerCommand
  .command('start')
  .description('Start workers')
  .option('--count <n>', 'Number of workers', 1)
  .action((opts) => startWorkers(opts.count));

workerCommand
  .command('stop')
  .description('Stop all running workers gracefully')
  .action(() => stopWorkers());

program
  .command('list')
  .description('List all jobs')
  .option('--state <state>', 'Filter by state (pending, processing, completed, failed, dead)')
  .action(listJobs);

program
  .command('dlq <action> [id]')
  .description('Manage DLQ. Actions: list, retry <id>')
  .action(dlqHandler);

program
  .command('status')
  .description('Show summary of all job states')
  .action(showStatus);

program
  .command('config <action> [key] [value]')
  .description('Manage configuration. Example: config set max_retries 5')
  .action(configHandler);



program.parse(process.argv);
