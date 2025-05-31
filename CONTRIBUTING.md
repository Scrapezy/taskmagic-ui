# Contributing to Task Magic UI

Thank you for your interest in contributing to Task Magic UI! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn package manager
- Git version control
- Modern terminal emulator for testing

### Development Environment Setup

1. **Fork the Repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/taskmagic-ui.git
   cd taskmagic-ui
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Development Environment**
   ```bash
   # Build the project
   npm run build
   
   # Run tests to ensure everything works
   npm test
   
   # Start development mode
   npm run dev
   ```

## 🏗️ Project Structure

```
taskmagic-ui/
├── src/
│   ├── app.ts              # Main application entry
│   ├── cli.ts              # CLI command parsing
│   ├── types.ts            # TypeScript type definitions
│   ├── taskmagic-parser.ts # Core parsing logic
│   ├── file-watcher.ts     # File monitoring
│   └── ui/
│       ├── dashboard.ts    # Main dashboard UI
│       └── task-detail.ts  # Task detail view
├── tests/
│   ├── setup.ts            # Test configuration
│   ├── mocks/              # Mock data for testing
│   └── unit/               # Unit tests
├── .ai/                    # Task Magic project files
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## 🔧 Development Workflow

### Branch Naming Convention

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Commit Message Format

Follow the conventional commits specification:

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
```
feat(ui): add keyboard shortcuts to task detail view
fix(parser): handle malformed YAML gracefully
docs(readme): update installation instructions
test(parser): add coverage for circular dependency detection
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make Changes**
   - Write clear, readable code
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   # Run all tests
   npm test
   
   # Check code coverage
   npm run test:coverage
   
   # Run linting
   npm run lint
   
   # Type check
   npm run type-check
   
   # Build project
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(ui): add amazing feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/amazing-feature
   ```
   
   Then create a Pull Request on GitHub with:
   - Clear title and description
   - Reference any related issues
   - Include screenshots/GIFs for UI changes
   - Mark as draft if work in progress

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- taskmagic-parser.test.ts

# Run tests with verbose output
VERBOSE_TESTS=true npm test
```

### Writing Tests

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test component interactions
- **Mock Data**: Use provided mock structures in `tests/mocks/`
- **Coverage**: Aim for 80%+ code coverage

Example test structure:
```typescript
describe('ComponentName', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = createTempDir();
    });

    afterEach(() => {
        cleanupTempDir(tempDir);
    });

    describe('methodName', () => {
        it('should handle normal case', () => {
            // Test implementation
        });

        it('should handle edge case', () => {
            // Test implementation
        });

        it('should throw error for invalid input', () => {
            // Test implementation
        });
    });
});
```

## 🎨 Code Style Guidelines

### TypeScript Standards

- Use TypeScript strict mode
- Prefer `interface` over `type` for object shapes
- Use explicit return types for public methods
- Avoid `any` type; use proper typing

### Formatting

- Use 4 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multiline objects/arrays
- Max line length: 100 characters

### Code Organization

- Group imports by: Node.js built-ins, external packages, internal modules
- Use clear, descriptive variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and small

Example:
```typescript
/**
 * Parses a Task Magic project and returns structured data
 * @param projectPath - Path to the project directory
 * @returns Parsed project structure with tasks and plans
 */
export function parseProject(projectPath: string): ProjectStructure {
    // Implementation
}
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment Information**
   - Node.js version
   - npm version
   - Operating system
   - Terminal emulator

2. **Steps to Reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior
   - Sample Task Magic project structure if relevant

3. **Additional Context**
   - Error messages or logs
   - Screenshots/terminal recordings
   - Workarounds you've tried

## 💡 Feature Requests

For new features:

1. **Check Existing Issues** - Ensure it hasn't been requested
2. **Describe the Problem** - What issue does this solve?
3. **Propose a Solution** - How should it work?
4. **Consider Alternatives** - Other approaches?
5. **Additional Context** - Use cases, examples, mockups

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `documentation` - Improvements or additions to docs
- `question` - Further information is requested
- `wontfix` - This will not be worked on

## 🚀 Release Process

### Version Bumping

We follow semantic versioning (SemVer):
- **Patch** (0.0.x) - Bug fixes
- **Minor** (0.x.0) - New features, backward compatible
- **Major** (x.0.0) - Breaking changes

### Release Checklist

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run full test suite
4. Build and test package
5. Create GitHub release
6. Publish to npm

## 📋 Code Review Guidelines

### For Contributors

- Keep PRs focused and small
- Write clear commit messages
- Add tests for new functionality
- Update documentation
- Respond to feedback promptly

### For Reviewers

- Be constructive and helpful
- Focus on code quality and maintainability
- Check for test coverage
- Verify documentation updates
- Test changes locally when possible

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions
- Report unacceptable behavior

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Pull Requests** - Code review and collaboration

## 📚 Development Resources

### Useful Commands

```bash
# Development
npm run dev          # Development mode with watch
npm run build        # Build for production
npm run clean        # Clean build artifacts

# Testing
npm test             # Run all tests
npm run test:watch   # Watch mode testing
npm run test:coverage # Coverage report

# Code Quality
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

### External Dependencies

- **blessed** - Terminal UI framework
- **js-yaml** - YAML parsing
- **chokidar** - File watching
- **jest** - Testing framework
- **typescript** - Type checking and compilation

### Learning Resources

- [blessed Documentation](https://github.com/chjj/blessed)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Node.js File System API](https://nodejs.org/api/fs.html)

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

- **Performance Optimization** - Handle larger projects efficiently
- **UI/UX Improvements** - Better visual design and user experience
- **Cross-Platform Support** - Windows compatibility improvements
- **Documentation** - More examples, tutorials, API docs
- **Testing** - Increase coverage, add integration tests
- **Accessibility** - Screen reader support, better keyboard navigation

## 🙏 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- README acknowledgments section

Thank you for contributing to Task Magic UI! 🚀 