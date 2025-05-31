import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { Task, TaskStatus, Plan, ProjectStructure } from './types';

export class TaskMagicParser {
    private static TASK_FILE_PATTERN = /^task(\d+(?:\.\d+)?)_(.+)\.md$/;
    private static YAML_FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;

    /**
     * Find the Task Magic project root by searching for .ai directory
     */
    static findProjectRoot(startPath: string = process.cwd()): string | null {
        let currentPath = path.resolve(startPath);

        while (currentPath !== path.dirname(currentPath)) {
            const aiPath = path.join(currentPath, '.ai');
            if (fs.existsSync(aiPath) && fs.statSync(aiPath).isDirectory()) {
                return currentPath;
            }
            currentPath = path.dirname(currentPath);
        }

        return null;
    }

    /**
     * Parse YAML frontmatter from a markdown file
     */
    static parseYamlFrontmatter(content: string): { frontmatter: any; body: string } {
        const match = content.match(this.YAML_FRONTMATTER_PATTERN);

        if (!match || !match[1]) {
            throw new Error('No YAML frontmatter found');
        }

        try {
            const frontmatter = yaml.load(match[1]) as any;
            if (!frontmatter || typeof frontmatter !== 'object') {
                throw new Error('Invalid YAML frontmatter structure');
            }
            const body = (match[2] || '').trim();
            return { frontmatter, body };
        } catch (error) {
            throw new Error(`Failed to parse YAML frontmatter: ${error}`);
        }
    }

    /**
     * Validate task frontmatter structure
     */
    static validateTaskFrontmatter(frontmatter: any): TaskStatus {
        const required = ['id', 'title', 'status', 'priority', 'feature', 'dependencies', 'created_at'];

        for (const field of required) {
            if (!(field in frontmatter)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate status
        const validStatuses = ['pending', 'inprogress', 'completed', 'failed'];
        if (!validStatuses.includes(frontmatter.status)) {
            throw new Error(`Invalid status: ${frontmatter.status}. Must be one of: ${validStatuses.join(', ')}`);
        }

        // Validate priority
        const validPriorities = ['critical', 'high', 'medium', 'low'];
        if (!validPriorities.includes(frontmatter.priority)) {
            throw new Error(`Invalid priority: ${frontmatter.priority}. Must be one of: ${validPriorities.join(', ')}`);
        }

        // Ensure dependencies is array
        if (!Array.isArray(frontmatter.dependencies)) {
            throw new Error('Dependencies must be an array');
        }

        return frontmatter as TaskStatus;
    }

    /**
     * Parse markdown content to extract description, details, and test strategy
     */
    static parseTaskBody(body: string): { description: string; details: string[]; testStrategy: string; agentNotes?: string } {
        const sections = body.split(/\n## /);

        let description = '';
        let details: string[] = [];
        let testStrategy = '';
        let agentNotes: string | undefined;

        for (let section of sections) {
            if (section.startsWith('Description')) {
                description = section.replace('Description\n', '').trim();
            } else if (section.startsWith('Details')) {
                const detailsText = section.replace('Details\n', '').trim();
                details = detailsText.split('\n- ').filter(d => d.trim()).map(d => d.replace(/^- /, '').trim());
            } else if (section.startsWith('Test Strategy')) {
                testStrategy = section.replace('Test Strategy\n', '').trim();
            } else if (section.startsWith('Agent Notes')) {
                agentNotes = section.replace('Agent Notes\n', '').trim();
            }
        }

        const result: { description: string; details: string[]; testStrategy: string; agentNotes?: string } = {
            description,
            details,
            testStrategy
        };

        if (agentNotes) {
            result.agentNotes = agentNotes;
        }

        return result;
    }

    /**
     * Parse a single task file
     */
    static parseTaskFile(filePath: string): Task {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const { frontmatter, body } = this.parseYamlFrontmatter(content);

            const taskStatus = this.validateTaskFrontmatter(frontmatter);
            const taskBody = this.parseTaskBody(body);

            return {
                ...taskStatus,
                ...taskBody
            };
        } catch (error) {
            throw new Error(`Failed to parse task file ${filePath}: ${error}`);
        }
    }

    /**
     * Load all tasks from the tasks directory
     */
    static loadTasks(projectRoot: string): Task[] {
        const tasksDir = path.join(projectRoot, '.ai', 'tasks');

        if (!fs.existsSync(tasksDir)) {
            return [];
        }

        const tasks: Task[] = [];
        const files = fs.readdirSync(tasksDir);

        for (const file of files) {
            if (file.endsWith('.md') && this.TASK_FILE_PATTERN.test(file)) {
                try {
                    const task = this.parseTaskFile(path.join(tasksDir, file));
                    tasks.push(task);
                } catch (error) {
                    console.warn(`Skipping malformed task file ${file}: ${error}`);
                }
            }
        }

        return tasks.sort((a, b) => {
            const aId = typeof a.id === 'string' ? parseFloat(a.id) : a.id;
            const bId = typeof b.id === 'string' ? parseFloat(b.id) : b.id;
            return aId - bId;
        });
    }

    /**
     * Load plans from the plans directory
     */
    static loadPlans(projectRoot: string): Plan[] {
        const plansDir = path.join(projectRoot, '.ai', 'plans');
        const plans: Plan[] = [];

        if (!fs.existsSync(plansDir)) {
            return plans;
        }

        // Load global plan
        const globalPlanPath = path.join(plansDir, 'PLAN.md');
        if (fs.existsSync(globalPlanPath)) {
            plans.push({
                title: 'Global Plan',
                path: globalPlanPath,
                content: fs.readFileSync(globalPlanPath, 'utf-8'),
                type: 'global'
            });
        }

        // Load feature plans
        const featuresDir = path.join(plansDir, 'features');
        if (fs.existsSync(featuresDir)) {
            const featureFiles = fs.readdirSync(featuresDir);

            for (const file of featureFiles) {
                if (file.endsWith('.md')) {
                    const filePath = path.join(featuresDir, file);
                    plans.push({
                        title: file.replace('.md', '').replace(/_/g, ' '),
                        path: filePath,
                        content: fs.readFileSync(filePath, 'utf-8'),
                        type: 'feature'
                    });
                }
            }
        }

        return plans;
    }

    /**
     * Detect circular dependencies in tasks
     */
    static detectCircularDependencies(tasks: Task[]): string[] {
        const errors: string[] = [];
        const visited = new Set<string | number>();
        const visiting = new Set<string | number>();

        function visit(taskId: string | number): boolean {
            if (visiting.has(taskId)) {
                return true; // Circular dependency found
            }
            if (visited.has(taskId)) {
                return false; // Already processed
            }

            visiting.add(taskId);

            const task = tasks.find(t => t.id === taskId);
            if (task) {
                for (const depId of task.dependencies) {
                    if (visit(depId)) {
                        errors.push(`Circular dependency detected: Task ${taskId} -> Task ${depId}`);
                    }
                }
            }

            visiting.delete(taskId);
            visited.add(taskId);
            return false;
        }

        for (const task of tasks) {
            visit(task.id);
        }

        return errors;
    }

    /**
     * Load complete project structure
     */
    static loadProject(projectPath?: string): ProjectStructure {
        const projectRoot = this.findProjectRoot(projectPath);

        if (!projectRoot) {
            return {
                tasks: [],
                plans: [],
                projectPath: projectPath || process.cwd(),
                isValid: false
            };
        }

        try {
            const tasks = this.loadTasks(projectRoot);
            const plans = this.loadPlans(projectRoot);

            // Check for circular dependencies
            const circularErrors = this.detectCircularDependencies(tasks);
            if (circularErrors.length > 0) {
                console.warn('Circular dependencies detected:', circularErrors);
            }

            return {
                tasks,
                plans,
                projectPath: projectRoot,
                isValid: true
            };
        } catch (error) {
            console.error(`Failed to load project: ${error}`);
            return {
                tasks: [],
                plans: [],
                projectPath: projectRoot,
                isValid: false
            };
        }
    }
}