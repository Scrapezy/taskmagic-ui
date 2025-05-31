/* eslint-disable @typescript-eslint/no-explicit-any */
import * as blessed from 'blessed';
import { TaskMagicProject, Task } from '../types';

export class TaskDetailView {
  private screen: blessed.Widgets.Screen;
  private project: TaskMagicProject;
  private task: Task;
  private mainContainer!: blessed.Widgets.BoxElement;
  private headerBox!: blessed.Widgets.BoxElement;
  private contentContainer!: blessed.Widgets.BoxElement;
  private taskInfoBox!: blessed.Widgets.BoxElement;
  private dependencyBox!: blessed.Widgets.BoxElement;
  private descriptionBox!: blessed.Widgets.BoxElement;
  private detailsBox!: blessed.Widgets.BoxElement;
  private testStrategyBox!: blessed.Widgets.BoxElement;
  private breadcrumbBox!: blessed.Widgets.BoxElement;
  private navigationBox!: blessed.Widgets.BoxElement;
  private dependencyList!: blessed.Widgets.ListElement;

  // Navigation state
  private currentSection: number = 1;
  private sections: (
    | blessed.Widgets.BoxElement
    | blessed.Widgets.ListElement
  )[] = [];
  private breadcrumbs: Task[] = [];
  private onExit: () => void;

  constructor(
    project: TaskMagicProject,
    task: Task,
    breadcrumbs: Task[] = [],
    onExit?: () => void
  ) {
    this.project = project;
    this.task = task;
    this.breadcrumbs = [...breadcrumbs, task];
    this.onExit = onExit || (() => process.exit(0));
    this.screen = blessed.screen({
      smartCSR: true,
      title: `Task Magic UI - Task ${task.id}: ${task.title}`,
    });

    this.createLayout();
    this.setupKeyboard();
    this.updateContent();

    // Set initial focus to dependency list and highlight it
    this.dependencyList.focus();
    this.highlightCurrentSection();
  }

  private createLayout(): void {
    // Main container
    this.mainContainer = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      style: {
        fg: 'white',
      },
    } as any);

    // Breadcrumb navigation
    this.breadcrumbBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      border: {
        type: 'line',
        fg: 'cyan',
      },
      style: {
        fg: 'white',
        border: {
          fg: 'cyan',
        },
      },
      tags: true,
    } as any);

    // Header with task basic info
    this.headerBox = blessed.box({
      top: 3,
      left: 0,
      width: '100%',
      height: 8,
      border: {
        type: 'line',
        fg: 'cyan',
      },
      style: {
        fg: 'white',
        border: {
          fg: 'cyan',
        },
      },
      tags: true,
    } as any);

    // Content container for scrollable sections
    this.contentContainer = blessed.box({
      top: 11,
      left: 0,
      width: '100%',
      height: '100%-14',
      style: {
        fg: 'white',
      },
    } as any);

    // Task information panel (left side)
    this.taskInfoBox = blessed.box({
      parent: this.contentContainer,
      top: 0,
      left: 0,
      width: '50%',
      height: '50%',
      border: {
        type: 'line',
        fg: 'cyan',
      },
      style: {
        fg: 'white',
        border: {
          fg: 'cyan',
        },
      },
      tags: true,
      scrollable: true,
      keys: true,
      mouse: true,
    } as any);

    // Dependency visualization (right side)
    this.dependencyBox = blessed.box({
      parent: this.contentContainer,
      top: 0,
      left: '50%',
      width: '50%',
      height: '50%',
      border: {
        type: 'line',
        fg: 'cyan',
      },
      style: {
        fg: 'white',
        border: {
          fg: 'cyan',
        },
      },
      tags: true,
    } as any);

    // Description section (bottom left)
    this.descriptionBox = blessed.box({
      parent: this.contentContainer,
      top: '50%',
      left: 0,
      width: '33%',
      height: '50%',
      border: {
        type: 'line',
        fg: 'cyan',
      },
      style: {
        fg: 'white',
        border: {
          fg: 'cyan',
        },
      },
      tags: true,
      scrollable: true,
      keys: true,
      mouse: true,
    } as any);

    // Details section (bottom center)
    this.detailsBox = blessed.box({
      parent: this.contentContainer,
      top: '50%',
      left: '33%',
      width: '34%',
      height: '50%',
      border: {
        type: 'line',
        fg: 'cyan',
      },
      style: {
        fg: 'white',
        border: {
          fg: 'cyan',
        },
      },
      tags: true,
      scrollable: true,
      keys: true,
      mouse: true,
    } as any);

    // Test strategy section (bottom right)
    this.testStrategyBox = blessed.box({
      parent: this.contentContainer,
      top: '50%',
      left: '67%',
      width: '33%',
      height: '50%',
      border: {
        type: 'line',
        fg: 'cyan',
      },
      style: {
        fg: 'white',
        border: {
          fg: 'cyan',
        },
      },
      tags: true,
      scrollable: true,
      keys: true,
      mouse: true,
    } as any);

    // Dependency list (inside dependency box)
    this.dependencyList = blessed.list({
      parent: this.dependencyBox,
      top: 1,
      left: 1,
      width: '100%-2',
      height: '100%-2',
      keys: true,
      vi: true,
      mouse: true,
      style: {
        fg: 'white',
        selected: {
          bg: 'blue',
          fg: 'white',
        },
        focus: {
          bg: 'blue',
          fg: 'white',
        },
      },
      tags: true,
    } as any);

    // Navigation help (bottom)
    this.navigationBox = blessed.box({
      top: '100%-3',
      left: 0,
      width: '100%',
      height: 3,
      border: {
        type: 'line',
        fg: 'yellow',
      },
      style: {
        fg: 'white',
        border: {
          fg: 'yellow',
        },
      },
      tags: true,
    } as any);

    // Setup sections for navigation
    this.sections = [
      this.dependencyList,
      this.taskInfoBox,
      this.descriptionBox,
      this.detailsBox,
      this.testStrategyBox,
    ];

    this.screen.append(this.mainContainer);
    this.mainContainer.append(this.breadcrumbBox);
    this.mainContainer.append(this.headerBox);
    this.mainContainer.append(this.contentContainer);
    this.mainContainer.append(this.navigationBox);
  }

  private setupKeyboard(): void {
    // Exit to dashboard
    this.screen.key(['escape'], () => {
      this.exitToParent();
    });

    // Section navigation with Tab
    this.screen.key(['tab'], () => {
      this.nextSection();
    });

    this.screen.key(['shift+tab'], () => {
      this.previousSection();
    });

    // Navigate to dependency from list
    this.dependencyList.key(['enter'], () => {
      this.navigateToDependency();
    });

    // Quick navigation with number keys
    for (let i = 1; i <= 9; i++) {
      this.screen.key([i.toString()], () => {
        this.navigateToDepByIndex(i - 1);
      });
    }

    // Breadcrumb navigation
    this.screen.key(['b'], () => {
      this.showBreadcrumbMenu();
    });

    // Back in breadcrumb
    this.screen.key(['backspace'], () => {
      this.navigateBack();
    });

    // Refresh
    this.screen.key(['r'], () => {
      this.refresh();
    });

    // Quit
    this.screen.key(['q', 'C-c'], () => {
      process.exit(0);
    });
  }

  private updateContent(): void {
    this.updateBreadcrumb();
    this.updateHeader();
    this.updateTaskInfo();
    this.updateDependencyTree();
    this.updateDescription();
    this.updateDetails();
    this.updateTestStrategy();
    this.updateNavigation();
    this.screen.render();
  }

  private updateBreadcrumb(): void {
    const breadcrumbText = this.breadcrumbs
      .map((task, index) => {
        const isLast = index === this.breadcrumbs.length - 1;
        const prefix = index === 0 ? '' : ' → ';
        const taskText = `[${task.id}] ${task.title}`;
        return isLast
          ? `${prefix}{bold}${taskText}{/bold}`
          : `${prefix}${taskText}`;
      })
      .join('');

    const content = `{center}{bold}Navigation Breadcrumb{/bold}{/center}\n${breadcrumbText}`;
    this.breadcrumbBox.setContent(content);
  }

  private updateHeader(): void {
    const status = this.colorizeStatus(this.task.status);
    const priority = this.colorizePriority(this.task.priority);

    const content = `{center}{bold}Task ${this.task.id}: ${this.task.title}{/bold}{/center}

{bold}Status:{/bold} ${status}  {bold}Priority:{/bold} ${priority}  {bold}Feature:{/bold} ${this.task.feature || 'No feature'}
{bold}Agent:{/bold} ${this.task.assigned_agent || 'Unassigned'}

{bold}Timeline:{/bold}
Created: ${this.formatDate(this.task.created_at)}  Started: ${this.formatDate(this.task.started_at) || '{gray-fg}Not started{/gray-fg}'}  Completed: ${this.formatDate(this.task.completed_at) || '{gray-fg}Not completed{/gray-fg}'}`;

    this.headerBox.setContent(content);
  }

  private updateTaskInfo(): void {
    let content = `{center}{bold}Task Information{/bold}{/center}\n\n`;

    // YAML frontmatter display
    content += `{bold}YAML Frontmatter:{/bold}\n`;
    content += `───────────────────\n`;
    content += `id: ${this.task.id}\n`;
    content += `title: ${this.task.title}\n`;
    content += `status: ${this.task.status}\n`;
    content += `priority: ${this.task.priority}\n`;
    content += `feature: ${this.task.feature || 'null'}\n`;
    content += `dependencies: [${this.task.dependencies.join(', ')}]\n`;
    content += `assigned_agent: ${this.task.assigned_agent || 'null'}\n`;
    content += `created_at: ${this.task.created_at}\n`;
    content += `started_at: ${this.task.started_at || 'null'}\n`;
    content += `completed_at: ${this.task.completed_at || 'null'}\n`;
    if (this.task.error_log) {
      content += `error_log: ${this.task.error_log}\n`;
    }

    // Agent notes if present
    if ((this.task as any as { agent_notes?: string }).agent_notes) {
      content += `\n{bold}Agent Notes:{/bold}\n`;
      content += `──────────────\n`;
      content += `${(this.task as any as { agent_notes: string }).agent_notes}\n`;
    }

    this.taskInfoBox.setContent(content);
  }

  private updateDependencyTree(): void {
    const dependencies = this.getDependencyTasks();
    const dependents = this.getDependentTasks();

    let content = `{center}{bold}Dependency Visualization{/bold}{/center}\n\n`;

    if (dependencies.length > 0) {
      content += `{bold}Dependencies (${dependencies.length}):{/bold}\n`;
      dependencies.forEach((dep, index) => {
        const status = this.colorizeStatus(dep.status);
        content += `${index + 1}. [${dep.id}] ${dep.title} (${status})\n`;
      });
    } else {
      content += `{bold}Dependencies:{/bold} {gray-fg}None{/gray-fg}\n`;
    }

    content += `\n`;

    if (dependents.length > 0) {
      content += `{bold}Dependent Tasks (${dependents.length}):{/bold}\n`;
      dependents.forEach((dep, index) => {
        const status = this.colorizeStatus(dep.status);
        const navNumber = dependencies.length + index + 1;
        content += `${navNumber}. [${dep.id}] ${dep.title} (${status})\n`;
      });
    } else {
      content += `{bold}Dependent Tasks:{/bold} {gray-fg}None{/gray-fg}\n`;
    }

    // Add navigation help if there are navigable tasks
    const totalNavigable = dependencies.length + dependents.length;
    if (totalNavigable > 0) {
      content += `\n{center}─────────────────────────────────────{/center}`;
      content += `\n{center}{yellow-fg}Navigation List (↑/↓ + Enter or 1-${totalNavigable}):{/yellow-fg}{/center}`;
    }

    this.dependencyBox.setContent(content);

    // Update dependency list for navigation - include BOTH dependencies and dependent tasks
    const allNavigableTasks = [...dependencies, ...dependents];
    const listItems = allNavigableTasks.map((task, index) => {
      const type = index < dependencies.length ? 'DEP' : 'REQ';
      return `[${type}] [${task.id}] ${task.title} (${task.status})`;
    });
    this.dependencyList.setItems(listItems);

    // Ensure proper selection if items exist and reset selection index
    if (listItems.length > 0) {
      // Reset to first item to avoid invalid selection indices
      this.dependencyList.select(0);

      // If this is the currently focused section, ensure focus is maintained
      if (this.currentSection === 1) {
        this.dependencyList.focus();
      }
    }
  }

  private updateDescription(): void {
    let content = `{center}{bold}Description{/bold}{/center}\n\n`;
    content +=
      this.task.description || '{gray-fg}No description available{/gray-fg}';
    this.descriptionBox.setContent(content);
  }

  private updateDetails(): void {
    let content = `{center}{bold}Implementation Details{/bold}{/center}\n\n`;

    if (this.task.details) {
      if (Array.isArray(this.task.details)) {
        this.task.details.forEach((detail, index) => {
          content += `${index + 1}. ${detail}\n\n`;
        });
      } else {
        content += this.task.details;
      }
    } else {
      content += '{gray-fg}No implementation details available{/gray-fg}';
    }

    this.detailsBox.setContent(content);
  }

  private updateTestStrategy(): void {
    let content = `{center}{bold}Test Strategy{/bold}{/center}\n\n`;
    content +=
      this.task.testStrategy || '{gray-fg}No test strategy defined{/gray-fg}';
    this.testStrategyBox.setContent(content);
  }

  private updateNavigation(): void {
    const dependencies = this.getDependencyTasks();
    const dependents = this.getDependentTasks();
    const totalNavigable = dependencies.length + dependents.length;

    let content = `{center}{bold}Navigation:{/bold} ESC Back • TAB Next Section`;
    if (totalNavigable > 0) {
      content += ` • 1-${totalNavigable} Jump to Task`;
    }
    content += ` • B Breadcrumb • R Refresh • Q Quit{/center}`;

    this.navigationBox.setContent(content);
  }

  private getDependencyTasks(): Task[] {
    return this.task.dependencies
      .map((depId) => this.project.structure.tasks.find((t) => t.id === depId))
      .filter((task): task is Task => task !== undefined);
  }

  private getDependentTasks(): Task[] {
    return this.project.structure.tasks.filter((task) =>
      task.dependencies.includes(this.task.id)
    );
  }

  private nextSection(): void {
    this.currentSection = (this.currentSection + 1) % this.sections.length;
    const currentSection = this.sections[this.currentSection];
    if (currentSection) {
      currentSection.focus();
      this.highlightCurrentSection();
    }
  }

  private previousSection(): void {
    this.currentSection =
      (this.currentSection - 1 + this.sections.length) % this.sections.length;
    const currentSection = this.sections[this.currentSection];
    if (currentSection) {
      currentSection.focus();
      this.highlightCurrentSection();
    }
  }

  private highlightCurrentSection(): void {
    // Reset all section borders to cyan
    this.taskInfoBox.style.border.fg = 'cyan';
    this.dependencyBox.style.border.fg = 'cyan';
    this.descriptionBox.style.border.fg = 'cyan';
    this.detailsBox.style.border.fg = 'cyan';
    this.testStrategyBox.style.border.fg = 'cyan';

    // Highlight the current section
    if (this.currentSection === 0) {
      this.taskInfoBox.style.border.fg = 'yellow';
    } else if (this.currentSection === 1) {
      // When dependency list is focused, highlight the dependency box border
      this.dependencyBox.style.border.fg = 'yellow';
    } else if (this.currentSection === 2) {
      this.descriptionBox.style.border.fg = 'yellow';
    } else if (this.currentSection === 3) {
      this.detailsBox.style.border.fg = 'yellow';
    } else if (this.currentSection === 4) {
      this.testStrategyBox.style.border.fg = 'yellow';
    }

    this.screen.render();
  }

  private navigateToDependency(): void {
    const selectedIndex = (this.dependencyList as any as { selected: number })
      .selected;
    const dependencies = this.getDependencyTasks();
    const dependents = this.getDependentTasks();
    const allNavigableTasks = [...dependencies, ...dependents];

    if (selectedIndex >= 0 && selectedIndex < allNavigableTasks.length) {
      const targetTask = allNavigableTasks[selectedIndex];
      if (targetTask) {
        this.navigateToTask(targetTask);
      }
    }
  }

  private navigateToDepByIndex(index: number): void {
    const dependencies = this.getDependencyTasks();
    const dependents = this.getDependentTasks();
    const allNavigableTasks = [...dependencies, ...dependents];

    if (index < allNavigableTasks.length) {
      const targetTask = allNavigableTasks[index];
      if (targetTask) {
        this.navigateToTask(targetTask);
      }
    }
  }

  private navigateToTask(task: Task): void {
    // Clean up current screen
    this.screen.destroy();

    // Small delay to ensure screen is properly destroyed before creating new one
    setTimeout(() => {
      const detailView = new TaskDetailView(
        this.project,
        task,
        this.breadcrumbs,
        this.onExit
      );
      detailView.run();
    }, 10);
  }

  private showBreadcrumbMenu(): void {
    // Create a simple menu for breadcrumb navigation
    if (this.breadcrumbs.length > 1) {
      const menu = blessed.list({
        top: 'center',
        left: 'center',
        width: '60%',
        height: Math.min(this.breadcrumbs.length + 4, 15),
        border: {
          type: 'line',
          fg: 'yellow',
        },
        style: {
          selected: {
            bg: 'blue',
            fg: 'white',
          },
        },
        keys: true,
        vi: true,
        interactive: true,
        tags: true,
      } as any);

      const items = this.breadcrumbs.map(
        (task) => `[${task.id}] ${task.title}`
      );
      menu.setItems(items);

      menu.key(['enter'], () => {
        const selectedIndex = (menu as any as { selected: number }).selected;
        if (selectedIndex >= 0 && selectedIndex < this.breadcrumbs.length) {
          const targetTask = this.breadcrumbs[selectedIndex];
          this.screen.remove(menu);
          if (targetTask && targetTask.id !== this.task.id) {
            this.navigateToTaskInBreadcrumb(targetTask, selectedIndex);
          } else {
            const currentSection = this.sections[this.currentSection];
            if (currentSection) {
              currentSection.focus();
            }
            this.screen.render();
          }
        }
      });

      menu.key(['escape'], () => {
        this.screen.remove(menu);
        const currentSection = this.sections[this.currentSection];
        if (currentSection) {
          currentSection.focus();
        }
        this.screen.render();
      });

      this.screen.append(menu);
      menu.focus();
      this.screen.render();
    }
  }

  private navigateToTaskInBreadcrumb(
    task: Task,
    breadcrumbIndex: number
  ): void {
    // Clean up current screen
    this.screen.destroy();

    // Small delay to ensure screen is properly destroyed before creating new one
    setTimeout(() => {
      const newBreadcrumbs = this.breadcrumbs.slice(0, breadcrumbIndex + 1);
      const detailView = new TaskDetailView(
        this.project,
        task,
        newBreadcrumbs.slice(0, -1),
        this.onExit
      );
      detailView.run();
    }, 10);
  }

  private navigateBack(): void {
    if (this.breadcrumbs.length > 1) {
      const parentTask = this.breadcrumbs[this.breadcrumbs.length - 2];
      if (parentTask) {
        this.navigateToTaskInBreadcrumb(
          parentTask,
          this.breadcrumbs.length - 2
        );
      } else {
        this.exitToParent();
      }
    } else {
      this.exitToParent();
    }
  }

  private exitToParent(): void {
    this.screen.destroy();

    // Use the provided onExit callback if it exists
    this.onExit();
  }

  private refresh(): void {
    // In a real implementation, reload task data
    this.updateContent();
  }

  private colorizeStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
        return '{green-fg}' + status + '{/green-fg}';
      case 'inprogress':
      case 'in-progress':
        return '{yellow-fg}' + status + '{/yellow-fg}';
      case 'pending':
        return '{cyan-fg}' + status + '{/cyan-fg}';
      case 'failed':
        return '{red-fg}' + status + '{/red-fg}';
      default:
        return status;
    }
  }

  private colorizePriority(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'critical':
        return '{red-fg}' + priority + '{/red-fg}';
      case 'high':
        return '{yellow-fg}' + priority + '{/yellow-fg}';
      case 'medium':
        return '{cyan-fg}' + priority + '{/cyan-fg}';
      case 'low':
        return '{gray-fg}' + priority + '{/gray-fg}';
      default:
        return priority;
    }
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

  public run(): void {
    this.highlightCurrentSection();
    this.screen.render();

    // Ensure the current section gets focus after rendering
    // Use a small timeout to ensure the screen is fully rendered
    setTimeout(() => {
      const currentSection = this.sections[this.currentSection];
      if (currentSection) {
        currentSection.focus();
        this.screen.render();
      }
    }, 10);
  }

  public destroy(): void {
    this.screen.destroy();
  }
}
