#!/usr/bin/env node

import { Command } from 'commander';
import { TaskMagicApp } from './app';
import { Task } from './types';

const program = new Command();

program
  .name('taskmagic-ui')
  .description('Terminal dashboard for Task Magic projects')
  .version('0.1.0');

program
  .command('dashboard')
  .description('Launch interactive dashboard (default)')
  .option('-p, --path <path>', 'Project path to scan for Task Magic structure')
  .option('--no-watch', 'Disable file watching for automatic updates')
  .action(async (options) => {
    const app = new TaskMagicApp(options.watch !== false);

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('\n🔄 Shutting down gracefully...');
      await app.shutdown();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    const success = await app.initialize(options.path);

    if (!success) {
      process.exit(1);
    }

    // Launch the interactive dashboard
    await app.startDashboard();
  });

program
  .command('list')
  .description('List all tasks in table format')
  .option('-p, --path <path>', 'Project path to scan for Task Magic structure')
  .option('-f, --filter <type>', 'Filter tasks by status (pending, inprogress, completed, failed)')
  .action(async (options) => {
    const app = new TaskMagicApp(false); // No file watching for list command
    const success = await app.initialize(options.path);

    if (!success) {
      process.exit(1);
    }

    const project = app.getProject();
    if (!project) {
      console.error('❌ No project loaded');
      process.exit(1);
    }

    let tasks = project.structure.tasks;

    // Apply filter if specified
    if (options.filter) {
      tasks = tasks.filter((task: Task) => task.status === options.filter);
    }

    // Display tasks in table format
    console.log('\n📋 Task List:');
    console.log('┌─────┬──────────────┬──────────────┬──────────────────────────────────────────────┬──────────────┐');
    console.log('│ ID  │ Status       │ Priority     │ Title                                        │ Dependencies │');
    console.log('├─────┼──────────────┼──────────────┼──────────────────────────────────────────────┼──────────────┤');

    tasks.forEach((task: Task) => {
      const id = task.id.toString().padEnd(3);
      const status = task.status.padEnd(12);
      const priority = task.priority.padEnd(12);
      const title = task.title.length > 44 ? task.title.slice(0, 41) + '...' : task.title.padEnd(44);
      const deps = task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None';
      const depsFormatted = deps.length > 12 ? deps.slice(0, 9) + '...' : deps.padEnd(12);

      console.log(`│ ${id} │ ${status} │ ${priority} │ ${title} │ ${depsFormatted} │`);
    });

    console.log('└─────┴──────────────┴──────────────┴──────────────────────────────────────────────┴──────────────┘');
    console.log(`\nTotal: ${tasks.length} tasks`);
  });

program
  .command('stats')
  .description('Show project statistics')
  .option('-p, --path <path>', 'Project path to scan for Task Magic structure')
  .action(async (options) => {
    const app = new TaskMagicApp(false); // No file watching for stats command
    const success = await app.initialize(options.path);

    if (!success) {
      process.exit(1);
    }

    app.displayProjectSummary();
    console.log('\n✅ Task Magic project loaded successfully');
  });

program
  .command('help')
  .description('Display help information')
  .action(() => {
    console.log('📖 Task Magic UI - Help');
    console.log('');
    console.log('Available commands:');
    console.log('  dashboard    Launch interactive terminal dashboard (default)');
    console.log('  list         List all tasks in table format');
    console.log('  stats        Show project statistics');
    console.log('  help         Display this help information');
    console.log('');
    console.log('Options:');
    console.log('  -p, --path <path>    Specify project path');
    console.log('  -f, --filter <type>  Filter tasks by status (pending, inprogress, completed, failed)');
    console.log('  -v, --version        Show version number');
    console.log('  -h, --help           Display help information');
    console.log('');
    console.log('Examples:');
    console.log('  taskmagic-ui                           # Launch dashboard');
    console.log('  taskmagic-ui list                      # List all tasks');
    console.log('  taskmagic-ui list -f pending           # List pending tasks only');
    console.log('  taskmagic-ui stats                     # Show project statistics');
    console.log('  taskmagic-ui -p /path/to/project       # Use specific project path');
    console.log('');
    console.log('📋 For more information visit: https://github.com/scrapezy/taskmagic-ui');
  });

// Remove the old 'status' command since the README refers to it as 'stats'
// Keep this for backward compatibility but don't document it
program
  .command('status')
  .description('Quick status overview (deprecated, use "stats" instead)')
  .option('-p, --path <path>', 'Project path to scan for Task Magic structure')
  .action(async (options) => {
    console.log('⚠️  The "status" command is deprecated. Please use "stats" instead.');
    const app = new TaskMagicApp(false);
    const success = await app.initialize(options.path);

    if (!success) {
      process.exit(1);
    }

    app.displayProjectSummary();
    console.log('\n✅ Task Magic project loaded successfully');
  });

// Default command - launch dashboard
program
  .action(async (options) => {
    const app = new TaskMagicApp(); // Default with file watching enabled

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('\n🔄 Shutting down gracefully...');
      await app.shutdown();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    const success = await app.initialize(options.path);

    if (!success) {
      process.exit(1);
    }

    console.log('\n🎯 Launching Task Magic Terminal Dashboard...');
    console.log('Press q or Ctrl+C to exit, r to refresh\n');

    // Give a moment for the user to read the message
    setTimeout(async () => {
      await app.startDashboard();
    }, 1000);
  });

program.parse();
