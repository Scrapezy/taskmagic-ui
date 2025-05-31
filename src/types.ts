// Task Magic core types
export interface TaskStatus {
  id: string | number;
  title: string;
  status: 'pending' | 'inprogress' | 'completed' | 'failed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  feature: string;
  dependencies: (string | number)[];
  assigned_agent: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_log: string | null;
}

export interface TaskDetails {
  description?: string;
  details?: string[];
  testStrategy?: string;
  agentNotes?: string;
}

export interface Task extends TaskStatus, TaskDetails { }

export interface ProjectStructure {
  tasks: Task[];
  plans: Plan[];
  projectPath: string;
  isValid: boolean;
}

export interface Plan {
  title: string;
  path: string;
  content: string;
  type: 'global' | 'feature';
}

export interface DashboardState {
  currentView: 'overview' | 'tasks' | 'task-detail' | 'plans';
  selectedTask: Task | null;
  filter: TaskFilter;
  searchQuery: string;
}

export interface TaskFilter {
  status?: TaskStatus['status'][];
  priority?: TaskStatus['priority'][];
  feature?: string[];
}

export interface TaskMagicProject {
  structure: ProjectStructure;
  state: DashboardState;
}
