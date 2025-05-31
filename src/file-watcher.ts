import { watch, FSWatcher } from 'chokidar';
import { EventEmitter } from 'events';
import * as path from 'path';
import { TaskMagicParser } from './taskmagic-parser';
import { ProjectStructure, Task, Plan } from './types';

export interface FileWatcherEvents {
  'project-changed': (structure: ProjectStructure) => void;
  'task-changed': (
    task: Task,
    action: 'added' | 'modified' | 'deleted'
  ) => void;
  'plan-changed': (
    plan: Plan,
    action: 'added' | 'modified' | 'deleted'
  ) => void;
  'watching-started': () => void;
  'watching-stopped': () => void;
  error: (error: Error) => void;
}

export class FileWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null;
  private projectPath: string;
  private isWatching = false;
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly debounceMs = 300; // Debounce file changes to prevent excessive parsing

  constructor(projectPath: string) {
    super();
    this.projectPath = projectPath;
  }

  /**
   * Start watching the .ai directory for changes
   */
  start(): void {
    if (this.isWatching) {
      return;
    }

    const watchPath = path.join(this.projectPath, '.ai');

    this.watcher = watch(watchPath, {
      persistent: true,
      ignoreInitial: true, // Don't emit events for existing files
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    this.watcher.on('add', (filePath) => {
      this.handleFileChange(filePath, 'added');
    });

    this.watcher.on('change', (filePath) => {
      this.handleFileChange(filePath, 'modified');
    });

    this.watcher.on('unlink', (filePath) => {
      this.handleFileChange(filePath, 'deleted');
    });

    this.watcher.on('error', (error) => {
      this.emit('error', error);
    });

    this.watcher.on('ready', () => {
      this.isWatching = true;
      this.emit('watching-started');
    });
  }

  /**
   * Stop watching for file changes
   */
  async stop(): Promise<void> {
    if (!this.isWatching || !this.watcher) {
      return;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    await this.watcher.close();
    this.watcher = null;
    this.isWatching = false;
    this.emit('watching-stopped');
  }

  /**
   * Handle file change events with debouncing
   */
  private handleFileChange(
    filePath: string,
    action: 'added' | 'modified' | 'deleted'
  ): void {
    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Debounce the file change handling
    this.debounceTimer = setTimeout(() => {
      this.processFileChange(filePath, action);
    }, this.debounceMs);
  }

  /**
   * Process a single file change
   */
  private processFileChange(
    filePath: string,
    action: 'added' | 'modified' | 'deleted'
  ): void {
    try {
      const relativePath = path.relative(this.projectPath, filePath);
      const fileName = path.basename(filePath);

      // Handle task files
      if (relativePath.includes('.ai/tasks') && fileName.endsWith('.md')) {
        this.handleTaskFileChange(filePath, action);
        return;
      }

      // Handle plan files
      if (relativePath.includes('.ai/plans') && fileName.endsWith('.md')) {
        this.handlePlanFileChange(filePath, action);
        return;
      }

      // Handle TASKS.md master file
      if (relativePath === '.ai/TASKS.md') {
        this.handleMasterTaskFileChange();
        return;
      }

      // For any other .ai directory change, reload the entire project
      if (relativePath.startsWith('.ai/')) {
        this.reloadProject();
      }
    } catch {
      this.emit('error', new Error('Failed to process file change'));
    }
  }

  /**
   * Handle changes to individual task files
   */
  private handleTaskFileChange(
    filePath: string,
    action: 'added' | 'modified' | 'deleted'
  ): void {
    try {
      if (action === 'deleted') {
        // For deletions, we need to reload the project to get accurate state
        this.reloadProject();
        return;
      }

      // For additions and modifications, parse the specific file
      const task = TaskMagicParser.parseTaskFile(filePath);
      this.emit('task-changed', task, action);

      // Also trigger a full project reload to ensure consistency
      this.reloadProject();
    } catch {
      // If parsing fails, reload the entire project
      this.reloadProject();
    }
  }

  /**
   * Handle changes to plan files
   */
  private handlePlanFileChange(
    _filePath: string,
    action: 'added' | 'modified' | 'deleted'
  ): void {
    try {
      if (action === 'deleted') {
        this.reloadProject();
        return;
      }

      // For plan files, we'll trigger a full project reload since plan parsing
      // is simpler and they're less frequently changed
      this.reloadProject();
    } catch {
      this.reloadProject();
    }
  }

  /**
   * Handle changes to the master TASKS.md file
   */
  private handleMasterTaskFileChange(): void {
    // Changes to master task file should trigger a full reload
    // since it represents the state of all tasks
    this.reloadProject();
  }

  /**
   * Reload the entire project structure
   */
  private reloadProject(): void {
    try {
      const structure = TaskMagicParser.loadProject(this.projectPath);
      this.emit('project-changed', structure);
    } catch {
      this.emit('error', new Error('Failed to reload project'));
    }
  }

  /**
   * Check if the watcher is currently active
   */
  isActive(): boolean {
    return this.isWatching;
  }

  /**
   * Get the current project path being watched
   */
  getProjectPath(): string {
    return this.projectPath;
  }

  // Type-safe event emitter methods
  override on<K extends keyof FileWatcherEvents>(
    event: K,
    listener: FileWatcherEvents[K]
  ): this {
    return super.on(event as string, listener as (...args: unknown[]) => void);
  }

  override emit<K extends keyof FileWatcherEvents>(
    event: K,
    ...args: Parameters<FileWatcherEvents[K]>
  ): boolean {
    return super.emit(event as string, ...args);
  }
}
