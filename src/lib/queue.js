import db from '../db/index.js';
import { randomUUID } from 'crypto';

// Is function ko replace karein
export const addJob = (command, id = null) => {
  const jobId = id || randomUUID();
  
  // Fetch configured max_retries
  const config = db.prepare("SELECT value FROM settings WHERE key = 'max_retries'").get();
  const maxRetries = config ? parseInt(config.value) : 3;

  const stmt = db.prepare(`
    INSERT INTO jobs (id, command, state, max_retries, next_run_at)
    VALUES (?, ?, 'pending', ?, datetime('now'))
  `);
  stmt.run(jobId, command, maxRetries);
  return jobId;
};

export const fetchNextJob = () => {
  // Atomic lock: Find a pending job that is due for execution and mark it processing
  const stmt = db.prepare(`
    UPDATE jobs
    SET state = 'processing', updated_at = datetime('now')
    WHERE id = (
      SELECT id FROM jobs
      WHERE (state = 'pending' OR state = 'failed')
      AND next_run_at <= datetime('now')
      ORDER BY created_at ASC
      LIMIT 1
    )
    RETURNING *
  `);
  return stmt.get();
};

export const completeJob = (id) => {
  const stmt = db.prepare(`
    UPDATE jobs SET state = 'completed', updated_at = datetime('now') WHERE id = ?
  `);
  stmt.run(id);
};

export const failJob = (id, error, attempts, maxRetries) => {
  const newAttempts = attempts + 1;
  let newState = 'failed';
  let nextRun = null;

  if (newAttempts >= maxRetries) {
    newState = 'dead'; // Move to DLQ
  } else {
    // 1. Get configured Backoff Base (Default: 2)
    const config = db.prepare("SELECT value FROM settings WHERE key = 'backoff_base'").get();
    const base = config ? parseInt(config.value) : 2;

    // 2. Calculate Delay: base ^ attempts
    const delaySeconds = Math.pow(base, newAttempts);
    const stmtDate = db.prepare(`SELECT datetime('now', '+${delaySeconds} seconds') as next`);
    nextRun = stmtDate.get().next;
  }

  const stmt = db.prepare(`
    UPDATE jobs
    SET state = ?, attempts = ?, last_error = ?, next_run_at = ?, updated_at = datetime('now')
    WHERE id = ?
  `);
  stmt.run(newState, newAttempts, error, nextRun, id);
};

export const getJobsByState = (state) => {
  let query = 'SELECT * FROM jobs';
  if (state) query += ' WHERE state = ?';
  const stmt = db.prepare(query);
  return state ? stmt.all(state) : stmt.all();
};

export const retryDlqJob = (id) => {
  const stmt = db.prepare(`
    UPDATE jobs
    SET state = 'pending', attempts = 0, next_run_at = datetime('now'), last_error = NULL
    WHERE id = ? AND state = 'dead'
  `);
  return stmt.run(id);
};