import db from '../db/index.js';
import chalk from 'chalk';

export const configHandler = (action, key, value) => {
  if (action === 'set') {
    if (!key || !value) {
      console.log(chalk.red('Usage: queuectl config set <key> <value>'));
      return;
    }
    
    // Update DB
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    stmt.run(key, value);
    console.log(chalk.green(`Configuration updated: ${key} = ${value}`));
  } 
  else if (action === 'get') {
    const stmt = db.prepare('SELECT * FROM settings');
    const rows = stmt.all();
    console.log(chalk.bold('Current Configuration:'));
    rows.forEach(r => console.log(`${r.key}: ${r.value}`));
  }
  else {
    console.log(chalk.red('Invalid action. Use "set" or "get".'));
  }
};