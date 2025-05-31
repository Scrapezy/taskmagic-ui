# Task Magic UI

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-lightgrey.svg)

**A beautiful terminal-based dashboard for visualizing and managing Task Magic project tasks.**

Navigate through your project tasks with an intuitive interface featuring real-time updates, dependency visualization, and comprehensive task details.

[🏠 Homepage](https://github.com/scrapezy/taskmagic-ui) • 
[🐛 Report Bug](https://github.com/scrapezy/taskmagic-ui/issues) • 
[✨ Request Feature](https://github.com/scrapezy/taskmagic-ui/issues)

---

## ✨ Features

- **📊 Beautiful Terminal Dashboard** - ASCII art header with comprehensive project overview
- **🔍 Interactive Task Browser** - Navigate tasks with keyboard shortcuts and filtering
- **📈 Real-time Progress Tracking** - Live project statistics and health indicators  
- **🌳 Dependency Visualization** - Interactive dependency trees and task relationships
- **💻 Full Task Detail View** - Comprehensive task information with YAML frontmatter
- **🔄 Real-time File Monitoring** - Automatic updates when Task Magic files change
- **⚡ Performance Optimized** - Handles large projects with 100+ tasks efficiently
- **🎨 Status-based Color Coding** - Visual indicators for task status and priority
- **🔎 Search & Filter** - Find tasks quickly with flexible filtering options
- **📝 Breadcrumb Navigation** - Maintain context when navigating between tasks

## 📋 System Requirements

- **Node.js**: 16.0.0 or higher
- **Terminal**: Any modern terminal with Unicode support
- **Operating System**: macOS, Linux, or Windows
- **Task Magic Project**: A valid Task Magic project structure with `.ai` directory

## 🚀 Installation

### NPM Installation (Recommended)

```bash
npm install -g taskmagic-ui
```

### NPX Usage (No Installation Required)

```bash
npx taskmagic-ui
```

### Local Development

```bash
git clone https://github.com/scrapezy/taskmagic-ui.git
cd taskmagic-ui
npm install
npm run build
npm start
```

## 📖 Usage

### Quick Start

Navigate to your Task Magic project directory and run:

```bash
taskmagic-ui
```

Or specify a project path:

```bash
taskmagic-ui /path/to/your/project
```

### Dashboard Mode (Default)

Launch the interactive dashboard:

```bash
taskmagic-ui dashboard
# or simply
taskmagic-ui
```

### Command Line Options

```bash
taskmagic-ui [command] [options]

Commands:
  dashboard    Launch interactive terminal dashboard (default)
  list         List all tasks in table format
  stats        Show project statistics
  help         Display help information

Options:
  -p, --path <path>    Specify project path
  -f, --filter <type>  Filter tasks by status (pending, inprogress, completed, failed)
  -v, --version        Show version number
  -h, --help           Display help information
```

## ⌨️ Keyboard Shortcuts

### Dashboard Navigation
- **q / Ctrl+C** - Quit application
- **r** - Refresh data
- **?** - Toggle help panel
- **ESC** - Go back / Clear search

### Task List Navigation
- **↑/↓ or j/k** - Navigate task list
- **Enter** - View task details
- **Tab** - Switch between panels

### Filtering & Search
- **1** - Show pending tasks
- **2** - Show in-progress tasks
- **3** - Show completed tasks
- **4** - Show failed tasks
- **5** - Show all tasks
- **f** - Cycle through filters
- **s** - Cycle through sort options
- **/** - Start search

### Task Detail View
- **ESC** - Return to dashboard
- **Tab** - Cycle through sections
- **Shift+Tab** - Previous section
- **1-9** - Jump to dependency by number
- **b** - Show breadcrumb menu
- **Backspace** - Navigate back in breadcrumb
- **r** - Refresh task data

## 🎯 Project Structure

Task Magic UI expects your project to follow the standard Task Magic structure:

```
your-project/
├── .ai/
│   ├── TASKS.md              # Master task list
│   ├── plans/
│   │   ├── PLAN.md          # Global project plan
│   │   └── features/        # Feature-specific plans
│   └── tasks/
│       ├── task1_setup.md   # Individual task files
│       ├── task2_feature.md
│       └── ...
├── src/                     # Your project source code
└── README.md
```

### Task File Format

Task files should include YAML frontmatter with the following structure:

```yaml
---
id: 1
title: 'Task Title'
status: pending  # pending | inprogress | completed | failed
priority: high   # critical | high | medium | low
feature: 'Feature Name'
dependencies: [2, 3]  # Array of task IDs this task depends on
assigned_agent: 'agent-name'
created_at: '2025-01-01T00:00:00Z'
started_at: null
completed_at: null
error_log: null
---

## Description
Task description here

## Details
- Implementation detail 1
- Implementation detail 2

## Test Strategy
Testing approach and criteria
```

## 🎨 Dashboard Interface

The dashboard is organized into several sections:

### Header Section
- ASCII art logo and version information
- Project name and quick help reminder

### Overview Panel
- Task progress bar with completion percentage
- Task count breakdown by status (Done, In Progress, Pending, Failed)
- Priority breakdown (Critical, High, Medium, Low)
- Project health indicator
- Available and blocked task counts

### Filter & Search Panel
- Current filter and sort settings
- Search results count
- Quick keyboard shortcuts reference

### Task List
- Interactive table with all task information
- Columns: ID, Status, Priority, Title, Dependencies
- Color-coded status and priority indicators
- Keyboard navigation support

## 🔧 Configuration

### Environment Variables

```bash
# Enable verbose test output
VERBOSE_TESTS=true npm test

# Set custom project path
TASKMAGIC_PROJECT_PATH=/path/to/project

# Disable file watching
TASKMAGIC_NO_WATCH=true
```

### Custom Colors

The application respects terminal color schemes and supports:
- 256-color terminals
- True color (24-bit) terminals
- Basic 16-color fallback

## 🐛 Troubleshooting

### Common Issues

**Q: Dashboard shows "No Task Magic project found"**
A: Ensure you're in a directory containing a `.ai` folder with Task Magic files, or specify the path with `-p`.

**Q: Tasks not updating in real-time**
A: File watching requires proper permissions. Try running with `TASKMAGIC_NO_WATCH=true` to disable file monitoring.

**Q: Terminal display issues**
A: Ensure your terminal supports Unicode and has sufficient width (minimum 120 characters recommended).

**Q: Performance issues with large projects**
A: The dashboard is optimized for projects with 100+ tasks. For extremely large projects (1000+ tasks), consider using the CLI commands instead.

### Performance Tips

- Use filtering to focus on relevant tasks
- Close other terminal applications to free up resources
- Ensure your terminal has hardware acceleration enabled
- Use a modern terminal emulator (iTerm2, Windows Terminal, etc.)

### Debug Mode

Enable debug logging:

```bash
DEBUG=taskmagic-ui:* taskmagic-ui
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Make your changes
5. Run tests: `npm test`
6. Build the project: `npm run build`
7. Test your changes: `npm start`
8. Commit your changes: `git commit -m 'Add amazing feature'`
9. Push to the branch: `git push origin feature/amazing-feature`
10. Open a Pull Request

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- taskmagic-parser.test.ts

# Run tests in watch mode
npm run test:watch
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## 📊 API Documentation

### TaskMagicParser

Core parser for Task Magic project files:

```typescript
import { TaskMagicParser } from 'taskmagic-ui';

// Load a complete project
const project = TaskMagicParser.loadProject('/path/to/project');

// Parse individual task file
const task = TaskMagicParser.parseTaskFile('/path/to/task.md');

// Validate task structure
TaskMagicParser.validateTaskFrontmatter(taskData);

// Detect circular dependencies
const errors = TaskMagicParser.detectCircularDependencies(tasks);
```

### Dashboard API

Create custom dashboard instances:

```typescript
import { TaskMagicDashboard } from 'taskmagic-ui';

const dashboard = new TaskMagicDashboard(project);
dashboard.run();
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [blessed](https://github.com/chjj/blessed) for terminal UI
- Task Magic project structure inspiration
- Community feedback and contributions

## 📞 Support

- 📧 Email: support@taskmagic-ui.com
- 🐛 Issues: [GitHub Issues](https://github.com/scrapezy/taskmagic-ui/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/scrapezy/taskmagic-ui/discussions)
- 📖 Wiki: [GitHub Wiki](https://github.com/scrapezy/taskmagic-ui/wiki)

---

Made with ❤️ for the Task Magic community

⭐ Star us on GitHub if this project helped you! 