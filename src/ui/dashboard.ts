/* eslint-disable @typescript-eslint/no-explicit-any */
import * as blessed from 'blessed';
import { TaskMagicProject, Task } from '../types';
import { TaskDetailView } from './task-detail';

export class TaskMagicDashboard {
  private screen: blessed.Widgets.Screen;
  private project: TaskMagicProject;
  private headerBox!: blessed.Widgets.BoxElement;
  private dashboardBox!: blessed.Widgets.BoxElement;
  private taskListBox!: blessed.Widgets.BoxElement;
  private taskTable!: blessed.Widgets.ListTableElement;
  private filterBox!: blessed.Widgets.BoxElement;
  private searchBox!: blessed.Widgets.TextboxElement;
  private helpBox!: blessed.Widgets.BoxElement;

  // State management
  private currentFilter: string = 'all';
  private currentSort: string = 'priority';
  private searchQuery: string = '';
  private showHelp: boolean = false;
  private filteredTasks: Task[] = [];

  constructor(project: TaskMagicProject) {
    this.project = project;
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Task Magic UI',
    });

    this.createLayout();
    this.setupKeyboard();
    this.updateFilteredTasks();
    this.updateContent();
  }

  private createLayout(): void {
    // Header with ASCII art and version info
    this.headerBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: 8,
      border: {
        type: 'line',
        fg: 'cyan' as any,
      },
      style: {
        fg: 'cyan' as any,
        border: {
          fg: 'cyan' as any,
        },
      },
      tags: true,
    });

    // Main dashboard with progress and statistics
    this.dashboardBox = blessed.box({
      top: 8,
      left: 0,
      width: '70%',
      height: 12,
      border: {
        type: 'line',
        fg: 'cyan' as any,
      },
      style: {
        fg: 'white' as any,
        border: {
          fg: 'cyan' as any,
        },
      },
      tags: true,
    });

    // Filter and search controls
    this.filterBox = blessed.box({
      top: 8,
      left: '70%',
      width: '30%',
      height: 12,
      border: {
        type: 'line',
        fg: 'yellow' as any,
      },
      style: {
        fg: 'yellow' as any,
        border: {
          fg: 'yellow' as any,
        },
      },
      tags: true,
    });

    // Search input box
    this.searchBox = blessed.textbox({
      parent: this.filterBox,
      top: 1,
      left: 1,
      width: '100%-2',
      height: 3,
      border: {
        type: 'line',
        fg: 'gray' as any,
      },
      style: {
        fg: 'white' as any,
        focus: {
          border: {
            fg: 'yellow' as any,
          },
        },
      },
      keys: true,
      mouse: true,
      inputOnFocus: true,
    });

    // Task list table
    this.taskListBox = blessed.box({
      top: 20,
      left: 0,
      width: '100%',
      height: '100%-20',
      border: {
        type: 'line',
        fg: 'cyan' as any,
      },
      style: {
        fg: 'gray' as any,
        border: {
          fg: 'cyan' as any,
        },
      },
    });

    this.taskTable = blessed.listtable({
      parent: this.taskListBox,
      top: 1,
      left: 1,
      width: '100%-2',
      height: '100%-2',
      interactive: true,
      keys: true,
      vi: true,
      style: {
        header: {
          fg: 'white' as any,
          bold: true,
        },
        cell: {
          fg: 'gray' as any,
        },
        selected: {
          bg: 'blue' as any,
          fg: 'white' as any,
        },
      },
      border: {
        type: 'line',
        fg: 'gray' as any,
      },
      tags: true,
    });

    // Help box (initially hidden)
    this.helpBox = blessed.box({
      top: 'center',
      left: 'center',
      width: '80%',
      height: '80%',
      border: {
        type: 'line',
        fg: 'yellow' as any,
      },
      style: {
        fg: 'white' as any,
        bg: 'black' as any,
        border: {
          fg: 'yellow' as any,
        },
      },
      hidden: true,
      tags: true,
    });

    this.screen.append(this.headerBox);
    this.screen.append(this.dashboardBox);
    this.screen.append(this.filterBox);
    this.screen.append(this.taskListBox);
    this.screen.append(this.helpBox);
  }

  private updateContent(): void {
    this.updateHeader();
    this.updateDashboard();
    this.updateFilterPanel();
    this.updateTaskList();
    this.screen.render();
  }

  private updateHeader(): void {
    const asciiArt = `
 ████████╗ █████╗ ███████╗██╗  ██╗    ███╗   ███╗ █████╗  ██████╗ ██╗ ██████╗
 ╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝    ████╗ ████║██╔══██╗██╔════╝ ██║██╔════╝
    ██║   ███████║███████╗█████╔╝     ██╔████╔██║███████║██║  ███╗██║██║     
    ██║   ██╔══██║╚════██║██╔═██╗     ██║╚██╔╝██║██╔══██║██║   ██║██║██║     
    ██║   ██║  ██║███████║██║  ██╗    ██║ ╚═╝ ██║██║  ██║╚██████╔╝██║╚██████╗
    ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝ ╚═════╝`;

    const versionInfo = `
{cyan-fg}Version: 0.1.0{/cyan-fg}    {cyan-fg}Project: ${this.getProjectName()}{/cyan-fg}    {gray-fg}Press ? for help{/gray-fg}`;

    this.headerBox.setContent(asciiArt + versionInfo);
  }

  private updateDashboard(): void {
    const { tasks } = this.project.structure;

    // Calculate statistics
    const stats = this.calculateStats(tasks);
    const blockedTasks = this.getBlockedTasks(tasks);

    // Create progress bar
    const progressBar = this.createProgressBar(stats.completed, stats.total);
    const progressPercent =
      stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    // Health indicator
    const healthColor = this.getHealthColor(
      progressPercent,
      blockedTasks.length
    );

    const content = `
{bold}Project Dashboard{/bold}
Tasks Progress: ${progressBar} {white-fg}${progressPercent}%{/white-fg}
Done: {green-fg}${stats.completed}{/green-fg}  In Progress: {yellow-fg}${stats.inProgress}{/yellow-fg}  Pending: {gray-fg}${stats.pending}{/gray-fg}  Failed: {red-fg}${stats.failed}{/red-fg}

{bold}Priority Breakdown:{/bold}
Critical: {red-fg}${stats.critical}{/red-fg}  High: {yellow-fg}${stats.high}{/yellow-fg}  Medium: {cyan-fg}${stats.medium}{/cyan-fg}  Low: {gray-fg}${stats.low}{/gray-fg}

{bold}Project Health:{/bold} ${healthColor}
Next Available: {green-fg}${stats.available}{/green-fg}  Blocked: {red-fg}${blockedTasks.length}{/red-fg}`;

    this.dashboardBox.setContent(content);
  }

  private updateFilterPanel(): void {
    const content = `
{bold}Filters & Search{/bold}

Filter: {cyan-fg}${this.currentFilter}{/cyan-fg}
Sort: {cyan-fg}${this.currentSort}{/cyan-fg}
Results: {white-fg}${this.filteredTasks.length}{/white-fg}

{bold}Quick Keys:{/bold}
1-5: Filter by status
f: Filter menu
s: Sort menu
/: Search`;

    this.filterBox.setContent(content);
  }

  private updateTaskList(): void {
    // Prepare table data using filtered tasks
    const headers = ['ID', 'Status', 'Priority', 'Title', 'Dependencies'];
    const rows = this.filteredTasks.map((task) => [
      task.id.toString(),
      this.colorizeStatus(task.status),
      this.colorizePriority(task.priority),
      this.truncateTitle(task.title, 40),
      this.formatDependencies(task.dependencies),
    ]);

    this.taskTable.setData([headers, ...rows]);
  }

  private updateFilteredTasks(): void {
    const { tasks } = this.project.structure;
    let filtered = [...tasks];

    // Apply status filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === this.currentFilter);
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.id.toString().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.currentSort) {
        case 'priority': {
          const priorityOrder: Record<string, number> = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1,
          };
          const aPriority = priorityOrder[a.priority] || 0;
          const bPriority = priorityOrder[b.priority] || 0;
          return bPriority - aPriority;
        }
        case 'id': {
          const aId =
            typeof a.id === 'number'
              ? a.id
              : parseInt(a.id.toString(), 10) || 0;
          const bId =
            typeof b.id === 'number'
              ? b.id
              : parseInt(b.id.toString(), 10) || 0;
          return aId - bId;
        }
        case 'status':
          return a.status.localeCompare(b.status);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    this.filteredTasks = filtered;
  }

  private calculateStats(tasks: Task[]) {
    const stats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      inProgress: tasks.filter((t) => t.status === 'inprogress').length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      failed: tasks.filter((t) => t.status === 'failed').length,
      critical: tasks.filter((t) => t.priority === 'critical').length,
      high: tasks.filter((t) => t.priority === 'high').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      low: tasks.filter((t) => t.priority === 'low').length,
      available: 0,
    };

    // Calculate available tasks (pending with completed dependencies)
    stats.available = tasks.filter((task) => {
      if (task.status !== 'pending') return false;
      return task.dependencies.every((depId) => {
        const depTask = tasks.find((t) => t.id === depId);
        return !depTask || depTask.status === 'completed';
      });
    }).length;

    return stats;
  }

  private createProgressBar(
    completed: number,
    total: number,
    width: number = 20
  ): string {
    const filled = Math.round((completed / total) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  private colorizeStatus(status: string): string {
    switch (status) {
      case 'completed':
        return '{green-fg}done{/green-fg}';
      case 'inprogress':
        return '{yellow-fg}in progress{/yellow-fg}';
      case 'pending':
        return '{gray-fg}pending{/gray-fg}';
      case 'failed':
        return '{red-fg}failed{/red-fg}';
      default:
        return status;
    }
  }

  private colorizePriority(priority: string): string {
    switch (priority) {
      case 'critical':
        return '{red-fg}critical{/red-fg}';
      case 'high':
        return '{yellow-fg}high{/yellow-fg}';
      case 'medium':
        return '{cyan-fg}medium{/cyan-fg}';
      case 'low':
        return '{gray-fg}low{/gray-fg}';
      default:
        return priority;
    }
  }

  private truncateTitle(title: string, maxLength: number): string {
    return title.length > maxLength
      ? title.substring(0, maxLength - 3) + '...'
      : title;
  }

  private formatDependencies(dependencies: (string | number)[]): string {
    if (dependencies.length === 0) return 'None';
    return dependencies.join(', ');
  }

  private getProjectName(): string {
    const projectPath = this.project.structure.projectPath;
    return projectPath.split('/').pop() || 'Task Magic Project';
  }

  private setupKeyboard(): void {
    // Global key bindings
    this.screen.key(['escape', 'q', 'C-c'], () => {
      this.exit();
    });

    this.screen.key(['r'], () => {
      this.refresh();
    });

    // Help toggle
    this.screen.key(['?'], () => {
      this.toggleHelp();
    });

    // Filter by status
    this.screen.key(['1'], () => {
      this.setFilter('pending');
    });

    this.screen.key(['2'], () => {
      this.setFilter('inprogress');
    });

    this.screen.key(['3'], () => {
      this.setFilter('completed');
    });

    this.screen.key(['4'], () => {
      this.setFilter('failed');
    });

    this.screen.key(['5'], () => {
      this.setFilter('all');
    });

    // Filter menu
    this.screen.key(['f'], () => {
      this.showFilterMenu();
    });

    // Sort menu
    this.screen.key(['s'], () => {
      this.showSortMenu();
    });

    // Search
    this.screen.key(['/'], () => {
      this.activateSearch();
    });

    // Clear search
    this.screen.key(['escape'], () => {
      if (this.searchQuery) {
        this.clearSearch();
      }
    });

    // Task selection with Enter
    this.taskTable.key(['enter'], () => {
      this.showTaskDetail();
    });

    // Focus on task table by default
    this.taskTable.focus();
  }

  private toggleHelp(): void {
    this.showHelp = !this.showHelp;
    if (this.showHelp) {
      this.showHelpDialog();
    } else {
      this.helpBox.hide();
      this.taskTable.focus();
      this.screen.render();
    }
  }

  private showHelpDialog(): void {
    const helpContent = `
{bold}{center}Task Magic UI - Help{/center}{/bold}

{bold}Navigation:{/bold}
  ↑/↓ or j/k    Navigate task list
  Enter         View task details
  Tab           Switch between panels

{bold}Filtering:{/bold}
  1             Show pending tasks
  2             Show in-progress tasks  
  3             Show completed tasks
  4             Show failed tasks
  5             Show all tasks
  f             Open filter menu

{bold}Sorting:{/bold}
  s             Open sort menu
  
{bold}Search:{/bold}
  /             Start search
  Escape        Clear search

{bold}General:{/bold}
  r             Refresh data
  ?             Toggle this help
  q/Ctrl+C      Quit

{center}Press ? again to close this help{/center}`;

    this.helpBox.setContent(helpContent);
    this.helpBox.show();
    this.helpBox.focus();
    this.screen.render();
  }

  private setFilter(filter: string): void {
    this.currentFilter = filter;
    this.updateFilteredTasks();
    this.updateContent();
  }

  private showFilterMenu(): void {
    // This would show a popup menu in a full implementation
    // For now, cycle through filters
    const filters = ['all', 'pending', 'inprogress', 'completed', 'failed'];
    const currentIndex = filters.indexOf(this.currentFilter);
    const nextIndex = (currentIndex + 1) % filters.length;
    const nextFilter = filters[nextIndex];
    if (nextFilter) {
      this.setFilter(nextFilter);
    }
  }

  private showSortMenu(): void {
    // This would show a popup menu in a full implementation
    // For now, cycle through sort options
    const sorts = ['priority', 'id', 'status', 'title'];
    const currentIndex = sorts.indexOf(this.currentSort);
    const nextIndex = (currentIndex + 1) % sorts.length;
    const nextSort = sorts[nextIndex];
    if (nextSort) {
      this.currentSort = nextSort;
      this.updateFilteredTasks();
      this.updateContent();
    }
  }

  private activateSearch(): void {
    this.searchBox.focus();
    this.searchBox.readInput((err, value) => {
      if (!err && value !== null && value !== undefined) {
        this.searchQuery = value;
        this.updateFilteredTasks();
        this.updateContent();
      }
      this.taskTable.focus();
    });
  }

  private clearSearch(): void {
    this.searchQuery = '';
    this.updateFilteredTasks();
    this.updateContent();
  }

  private showTaskDetail(): void {
    const selectedIndex = (this.taskTable as unknown as { selected: number })
      .selected;
    if (selectedIndex > 0 && selectedIndex <= this.filteredTasks.length) {
      const task = this.filteredTasks[selectedIndex - 1]; // -1 because of header row
      if (task) {
        this.screen.destroy();
        const onExit = () => {
          const dashboard = new TaskMagicDashboard(this.project);
          dashboard.run();
        };
        const detailView = new TaskDetailView(this.project, task, [], onExit);
        detailView.run();
      }
    }
  }

  private showTaskPopup(task: Task): void {
    const popup = blessed.box({
      top: 'center',
      left: 'center',
      width: '90%',
      height: '90%',
      border: {
        type: 'line',
        fg: 'cyan' as any,
      },
      style: {
        fg: 'white' as any,
        bg: 'black' as any,
        border: {
          fg: 'cyan' as any,
        },
      },
      tags: true,
      scrollable: true,
      keys: true,
      mouse: true,
    });

    // Get dependency chain information
    const dependencyInfo = this.buildDependencyInfo(task);
    const dependentTasks = this.findDependentTasks(task.id);

    const content = `
{bold}{center}Task Details - ID ${task.id}{/center}{/bold}

┌─ {bold}General Information{/bold} ─────────────────────────────────────────────────────┐
│ {bold}Title:{/bold} ${task.title}
│ {bold}Status:{/bold} ${this.colorizeStatus(task.status)}
│ {bold}Priority:{/bold} ${this.colorizePriority(task.priority)}
│ {bold}Feature:{/bold} ${task.feature || 'No feature specified'}
│ {bold}Assigned Agent:{/bold} ${task.assigned_agent || 'Unassigned'}
└──────────────────────────────────────────────────────────────────────────────────┘

┌─ {bold}Timeline{/bold} ──────────────────────────────────────────────────────────────────┐
│ {bold}Created:{/bold} ${this.formatDate(task.created_at)}
│ {bold}Started:{/bold} ${this.formatDate(task.started_at) || '{gray-fg}Not started{/gray-fg}'}
│ {bold}Completed:{/bold} ${this.formatDate(task.completed_at) || '{gray-fg}Not completed{/gray-fg}'}
${task.error_log ? `│ {bold}{red-fg}Error Log:{/red-fg}{/bold} ${task.error_log}` : ''}
└──────────────────────────────────────────────────────────────────────────────────┘

┌─ {bold}Dependencies{/bold} ─────────────────────────────────────────────────────────────┐
${this.formatDependencyTree(dependencyInfo)}
└──────────────────────────────────────────────────────────────────────────────────┘

${
  dependentTasks.length > 0
    ? `┌─ {bold}Dependent Tasks{/bold} ────────────────────────────────────────────────────────┐
${this.formatDependentTasks(dependentTasks)}
└──────────────────────────────────────────────────────────────────────────────────┘

`
    : ''
}┌─ {bold}Description{/bold} ─────────────────────────────────────────────────────────────┐
│ ${this.wrapText(task.description || 'No description available', 78)}
└──────────────────────────────────────────────────────────────────────────────────┘

┌─ {bold}Implementation Details{/bold} ───────────────────────────────────────────────────┐
${this.formatDetails(task.details)}
└──────────────────────────────────────────────────────────────────────────────────┘

┌─ {bold}Test Strategy{/bold} ────────────────────────────────────────────────────────────┐
│ ${this.wrapText(task.testStrategy || 'No test strategy defined', 78)}
└──────────────────────────────────────────────────────────────────────────────────┘

{center}{bold}Navigation:{/bold} ↑/↓ Scroll • Tab Jump to Dependency • Escape Close{/center}`;

    popup.setContent(content);

    // Enhanced keyboard navigation
    popup.key(['escape'], () => {
      this.screen.remove(popup);
      this.taskTable.focus();
      this.screen.render();
    });

    // Navigate to dependency tasks
    popup.key(['tab'], () => {
      if (task.dependencies.length > 0) {
        this.screen.remove(popup);
        const firstDep = this.project.structure.tasks.find(
          (t: Task) => t.id === task.dependencies[0]
        );
        if (firstDep) {
          this.showTaskPopup(firstDep);
        }
      }
    });

    // Navigate to dependent tasks
    popup.key(['shift+tab'], () => {
      if (dependentTasks.length > 0 && dependentTasks[0]) {
        this.screen.remove(popup);
        this.showTaskPopup(dependentTasks[0]);
      }
    });

    // Number keys to jump to specific dependencies
    for (let i = 1; i <= Math.min(9, task.dependencies.length); i++) {
      popup.key([i.toString()], () => {
        const depTask = this.project.structure.tasks.find(
          (t: Task) => t.id === task.dependencies[i - 1]
        );
        if (depTask) {
          this.screen.remove(popup);
          this.showTaskPopup(depTask);
        }
      });
    }

    this.screen.append(popup);
    popup.focus();
    this.screen.render();
  }

  private buildDependencyInfo(
    task: Task
  ): Array<{ task: Task; level: number }> {
    const visited = new Set<string | number>();
    const result: Array<{ task: Task; level: number }> = [];

    const traverse = (taskId: string | number, level: number) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);

      const depTask = this.project.structure.tasks.find(
        (t: Task) => t.id === taskId
      );
      if (depTask) {
        result.push({ task: depTask, level });
        depTask.dependencies.forEach((depId: string | number) =>
          traverse(depId, level + 1)
        );
      }
    };

    task.dependencies.forEach((depId: string | number) => traverse(depId, 0));
    return result.sort(
      (a, b) => a.level - b.level || Number(a.task.id) - Number(b.task.id)
    );
  }

  private findDependentTasks(taskId: string | number): Task[] {
    return this.project.structure.tasks.filter((task: Task) =>
      task.dependencies.includes(taskId)
    );
  }

  private formatDependencyTree(
    deps: Array<{ task: Task; level: number }>
  ): string {
    if (deps.length === 0) {
      return '│ {gray-fg}No dependencies{/gray-fg}';
    }

    return deps
      .map((dep) => {
        const indent = '  '.repeat(dep.level);
        const connector = dep.level > 0 ? '└─ ' : '├─ ';
        const status = this.colorizeStatus(dep.task.status);
        const priority = this.colorizePriority(dep.task.priority);
        return `│ ${indent}${connector}[${dep.task.id}] ${dep.task.title} (${status}, ${priority})`;
      })
      .join('\n');
  }

  private formatDependentTasks(tasks: Task[]): string {
    return tasks
      .map((task) => {
        const status = this.colorizeStatus(task.status);
        const priority = this.colorizePriority(task.priority);
        return `│ ├─ [${task.id}] ${task.title} (${status}, ${priority})`;
      })
      .join('\n');
  }

  private formatDetails(details: string | string[] | undefined): string {
    if (!details) {
      return '│ {gray-fg}No implementation details available{/gray-fg}';
    }

    const detailsArray = Array.isArray(details) ? details : [details];
    return detailsArray
      .map((detail) => `│ ${this.wrapText(detail, 78)}`)
      .join('\n');
  }

  private formatDate(dateStr: string | null): string | null {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch {
      return dateStr;
    }
  }

  private wrapText(text: string, width: number): string {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    return lines.join('\n│ ');
  }

  private refresh(): void {
    // In a real implementation, you'd reload the project data here
    this.updateContent();
  }

  private exit(): void {
    this.screen.destroy();
    process.exit(0);
  }

  public render(): void {
    this.screen.render();
  }

  public run(): void {
    this.render();
    this.screen.key(['escape', 'q', 'C-c'], () => {
      process.exit(0);
    });
  }

  public updateProject(project: TaskMagicProject): void {
    this.project = project;
    this.updateFilteredTasks();
    this.updateContent();
  }

  public destroy(): void {
    this.screen.destroy();
  }

  private getBlockedTasks(tasks: Task[]): Task[] {
    return tasks.filter((task) => {
      if (task.status !== 'pending') return false;

      // Check if any dependencies are not completed
      return task.dependencies.some((depId) => {
        const depTask = tasks.find((t) => t.id === depId);
        return depTask && depTask.status !== 'completed';
      });
    });
  }

  private getHealthColor(
    progressPercent: number,
    blockedCount: number
  ): string {
    if (progressPercent >= 80 && blockedCount === 0) {
      return '{green-fg}Excellent{/green-fg}';
    } else if (progressPercent >= 60 && blockedCount <= 2) {
      return '{yellow-fg}Good{/yellow-fg}';
    } else if (progressPercent >= 40 && blockedCount <= 5) {
      return '{yellow-fg}Fair{/yellow-fg}';
    } else {
      return '{red-fg}Needs Attention{/red-fg}';
    }
  }
}
