import { TaskMagicParser } from './taskmagic-parser';
import { TaskMagicProject } from './types';
import { TaskMagicDashboard } from './ui/dashboard';
import { FileWatcher } from './file-watcher';

export interface TaskMagicUIOptions {
  projectPath: string;
  watchFiles: boolean;
}

export class TaskMagicUI {
  private options: TaskMagicUIOptions;

  constructor(options: TaskMagicUIOptions) {
    this.options = options;
  }

  async start(): Promise<void> {
    console.log('Task Magic UI starting...');
    console.log('Project path:', this.options.projectPath);
    console.log(
      'File watching:',
      this.options.watchFiles ? 'enabled' : 'disabled'
    );

    // TODO: Implement actual dashboard in future tasks
    console.log('Dashboard implementation coming soon!');
  }
}

export class TaskMagicApp {
  private project: TaskMagicProject | null = null;
  private dashboard: TaskMagicDashboard | null = null;
  private fileWatcher: FileWatcher | null = null;
  private watchingEnabled = false;

  constructor(watchFiles = true) {
    this.watchingEnabled = watchFiles;
  }

  async initialize(projectPath?: string): Promise<boolean> {
    try {
      console.log('Loading Task Magic project...');

      const structure = TaskMagicParser.loadProject(projectPath);

      if (!structure.isValid) {
        console.error('❌ No valid Task Magic project found');
        console.log(
          'Please run this tool from a directory containing a .ai folder with tasks and plans'
        );
        return false;
      }

      this.project = {
        structure,
        state: {
          currentView: 'overview',
          selectedTask: null,
          filter: {},
          searchQuery: '',
        },
      };

      // Initialize file watcher if enabled
      if (this.watchingEnabled) {
        this.setupFileWatcher(structure.projectPath);
      }

      console.log(
        `✅ Loaded Task Magic project from: ${structure.projectPath}`
      );
      console.log(
        `📋 Found ${structure.tasks.length} tasks and ${structure.plans.length} plans`
      );

      if (this.watchingEnabled) {
        console.log(
          '📁 File watching enabled - dashboard will update automatically'
        );
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize Task Magic app:', error);
      return false;
    }
  }

  private setupFileWatcher(projectPath: string): void {
    this.fileWatcher = new FileWatcher(projectPath);

    this.fileWatcher.on('project-changed', (structure) => {
      if (this.project) {
        this.project.structure = structure;
        if (this.dashboard) {
          this.dashboard.updateProject(this.project);
        }
      }
    });

    this.fileWatcher.on('watching-started', () => {
      // Could show a status indicator in the dashboard
    });

    this.fileWatcher.on('error', (error) => {
      console.error('File watcher error:', error.message);
      // Continue without file watching if there's an error
    });

    this.fileWatcher.start();
  }

  async startDashboard(): Promise<void> {
    if (!this.project) {
      throw new Error('Project must be initialized before starting dashboard');
    }

    this.dashboard = new TaskMagicDashboard(this.project);
    this.dashboard.run();
  }

  async shutdown(): Promise<void> {
    if (this.fileWatcher) {
      await this.fileWatcher.stop();
    }

    if (this.dashboard) {
      this.dashboard.destroy();
    }
  }

  displayProjectSummary(): void {
    if (!this.project) return;

    const { tasks } = this.project.structure;

    // Count by status
    const statusCounts = {
      pending: tasks.filter((t) => t.status === 'pending').length,
      inprogress: tasks.filter((t) => t.status === 'inprogress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      failed: tasks.filter((t) => t.status === 'failed').length,
    };

    // Count by priority
    const priorityCounts = {
      critical: tasks.filter((t) => t.priority === 'critical').length,
      high: tasks.filter((t) => t.priority === 'high').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      low: tasks.filter((t) => t.priority === 'low').length,
    };

    console.log('\n📊 Project Summary:');
    console.log(
      `Status: ${statusCounts.completed} completed, ${statusCounts.inprogress} in progress, ${statusCounts.pending} pending, ${statusCounts.failed} failed`
    );
    console.log(
      `Priority: ${priorityCounts.critical} critical, ${priorityCounts.high} high, ${priorityCounts.medium} medium, ${priorityCounts.low} low`
    );

    // Show next available tasks (pending with no pending dependencies)
    const nextTasks = tasks.filter((task) => {
      if (task.status !== 'pending') return false;

      return task.dependencies.every((depId) => {
        const depTask = tasks.find((t) => t.id === depId);
        return !depTask || depTask.status === 'completed';
      });
    });

    if (nextTasks.length > 0) {
      console.log(`\n🚀 Next available tasks: ${nextTasks.length}`);
      nextTasks.slice(0, 3).forEach((task) => {
        console.log(`  • ID ${task.id}: ${task.title} (${task.priority})`);
      });
    }
  }

  getProject(): TaskMagicProject | null {
    return this.project;
  }
}
