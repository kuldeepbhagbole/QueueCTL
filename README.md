# QueueCTL - Background Job Queue System

QueueCTL is a production-grade, CLI-based background job queue system built with **Node.js** and **SQLite**. It is designed to manage background tasks reliably with support for concurrent workers, atomic locking, exponential backoff retries, and a Dead Letter Queue (DLQ) for fault tolerance.

---

[Demo Video](https://drive.google.com/file/d/1TMEJUrbfWvB4mV6wRq9TRtSnergAYGB1/view?usp=sharing)

## Author
Kuldeep Bhagbole

---

## 🚀 Features

* **Persistent Storage:** Jobs and configuration survive system restarts using SQLite (`queue.db`).
* **Concurrency:** Run multiple workers in parallel without race conditions (Atomic Locking).
* **Fault Tolerance:** Automatic retries with **Exponential Backoff** ($Delay = Base^{Attempts}$).
* **Dead Letter Queue (DLQ):** Isolates permanently failed jobs for manual inspection or retry.
* **Graceful Shutdown:** Workers complete their current task before shutting down via a database signal.
* **Dynamic Configuration:** Modify retry counts and backoff settings via CLI without code changes.
* **Dashboard:** Visual status summary of all jobs.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Database:** SQLite (via `better-sqlite3`) - Selected for high-performance synchronous I/O and zero-config persistence.
* **CLI Framework:** Commander.js
* **Utilities:** `date-fns` (Time formatting), `chalk` (Terminal styling).

---

## 📦 Setup Instructions

### Prerequisites
* Node.js (v16 or higher)
* npm

### Steps to Run Locally

1.  **Clone the Repository**
    ```bash
    git clone <YOUR_GITHUB_REPO_LINK_HERE>
    cd queuectl
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Link the CLI Globally**
    This step registers the `queuectl` command on your system so you can run it from any terminal.
    ```bash
    npm link
    ```

---

## 💻 Usage Guide

### 1. Enqueue a Job
Add a job to the queue using a JSON string.
*(Note: For Windows CMD, you must escape double quotes inside the JSON string as shown below).*

### Windows CMD format:
queuectl enqueue "{\"command\": \"echo Hello World\", \"id\": \"job-1\"}"

### Linux/Mac/PowerShell format:
queuectl enqueue '{"command": "echo Hello World", "id": "job-1"}'

### Start a single worker:
queuectl worker start --count 1

### Start multiple workers (e.g., 3) in parallel:
queuectl worker start --count 3

### Stop all workers gracefully (finishes current job first):
queuectl worker stop

### Show System Status Dashboard (Summary):
queuectl status

### List all jobs (regardless of state):
queuectl list

### List jobs filtered by state (pending, processing, completed, failed, dead):
queuectl list --state pending

### List all permanently failed jobs in DLQ:
queuectl dlq list

### Retry a specific job from DLQ (moves back to pending):
queuectl dlq retry job-1

### View current configuration settings:
queuectl config get

### Set maximum retries allowed (Default is 3):
queuectl config set max_retries 5

### Set exponential backoff base (Default is 2):
queuectl config set backoff_base 3

---

## ⚖️ Assumptions & Trade-offs

In building this "minimal production-grade" system, several architectural decisions were made to balance complexity, reliability, and the specific requirements of a CLI tool.

### 1. Polling vs. Event-Driven Architecture
* **Decision:** Workers use a **Polling Mechanism** (checking the DB every 1 second when idle) instead of an event emitter or Pub/Sub model (like Redis).
* **Trade-off:**
    * *Pro:* Higher reliability and simpler persistence. If the system crashes, jobs remain in the DB and are picked up immediately upon restart.
    * *Con:* Introduces a slight latency (up to 1s) between enqueueing and processing.

### 2. Database Choice (SQLite)
* **Decision:** Used **Better-SQLite3** (Serverless, File-based DB).
* **Trade-off:**
    * *Pro:* Zero configuration, easy to backup (single `.db` file), and excellent performance for a local CLI tool.
    * *Con:* Limits the system to **Vertical Scaling** (Single Machine). For a distributed system across multiple servers, a client-server DB like PostgreSQL would be required to handle concurrent network connections.

### 3. Command Execution & Security
* **Decision:** Used Node.js `child_process.exec` to run shell commands.
* **Assumption:** The user runs the worker in a trusted environment with necessary permissions.
* **Simplification:** We assume the host machine has the required binaries (e.g., `python`, `grep`) installed. We did not implement strict sandboxing (like Docker), so the worker executes commands directly on the host shell.

### 4. Worker Signaling
* **Decision:** Used a database-backed flag (`settings` table) for the `queuectl worker stop` command.
* **Trade-off:** This adds a minimal database read operation to every worker loop but ensures that workers running in different terminal windows/processes can be controlled centrally without complex Inter-Process Communication (IPC).

---

## 🧪 Testing Instructions

This project includes a comprehensive automated test suite to validate all core requirements: Enqueueing, Worker Execution, Retry Mechanism (Exponential Backoff), DLQ, and Persistence.

### 📂 Test Suite Structure
Tests are modularized in the `tests/` directory:
* `tests/1_enqueue_list.js`: Validates job submission and state filtering.
* `tests/2_worker_lifecycle.js`: Validates worker concurrency and graceful shutdown.
* `tests/3_dlq_retry.js`: Validates failure handling, retries, and Dead Letter Queue logic.
* `tests/4_config_status.js`: Validates dynamic configuration and dashboard stats.

### 🏃‍♂️ How to Run Tests

**Prerequisite:** Ensure the CLI is linked (`npm link`) and you have two terminal windows open.

#### ✅ Test Scenario 1: Core Functionality (Enqueue & List)
Validates that jobs are correctly parsed, stored in SQLite, and listed.
```bash
node tests/1_enqueue_list.js
```

## Foler Structure
```
queuectl/
├── bin/
│   └── index.js            # Main Entry Point (CLI command registration)
├── src/
│   ├── commands/           # Individual Command Handlers
│   │   ├── config.js       # Logic for 'queuectl config'
│   │   ├── dlq.js          # Logic for 'queuectl dlq'
│   │   ├── enqueue.js      # Logic for 'queuectl enqueue'
│   │   ├── list.js         # Logic for 'queuectl list'
│   │   ├── status.js       # Logic for 'queuectl status'
│   │   └── worker.js       # Logic for 'queuectl worker' (Start/Stop)
│   ├── db/
│   │   └── index.js        # Database Connection, Schema & Settings Table
│   ├── lib/
│   │   └── queue.js        # The "Brain": Add Job, Fetch Next, Fail, Retry Logic
│   └── utils/
│       └── formatter.js    # Helpers: Date formatting & Text truncation
├── tests/                  # Automated Test Suite
│   ├── helper.js           # Test Helpers (OS Compatibility)
│   ├── 1_enqueue_list.js   # Validates Enqueue & List
│   ├── 2_worker_lifecycle.js # Validates Concurrency & Stop
│   ├── 3_dlq_retry.js      # Validates Retry & DLQ
│   └── 4_config_status.js  # Validates Config & Status Dashboard
├── .gitignore              # Git Ignore file (node_modules, .db, etc.)
├── package.json            # Dependencies (commander, better-sqlite3, etc.)
├── README.md               # Project Documentation
└── queue.db                # (Auto-generated) The SQLite Database file

```