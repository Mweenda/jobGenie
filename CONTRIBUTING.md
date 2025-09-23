# Contributing to JobGenie

Thank you for your interest in contributing to JobGenie! This document provides guidelines and information for contributors.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Issue Reporting](#issue-reporting)
8. [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be respectful**: Treat all contributors with respect and kindness
- **Be inclusive**: Welcome newcomers and help them get started
- **Be constructive**: Provide helpful feedback and suggestions
- **Be professional**: Maintain a professional tone in all communications

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/jobGenie.git
   cd jobGenie
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your configuration values
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Run tests to ensure everything works**
   ```bash
   npm run test
   ```

### Recommended VS Code Extensions

- ESLint
- Prettier
- TypeScript Importer
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer

## Development Workflow

### Branch Strategy

We use a Git Flow-inspired branching strategy:

- **`prod`**: Production-ready code
- **`staging`**: Pre-production testing
- **`dev`**: Main development branch
- **Feature branches**: `feature/feature-name`
- **Bug fixes**: `fix/bug-description`
- **Hotfixes**: `hotfix/critical-fix`

### Creating a Feature Branch

```bash
# Start from the dev branch
git checkout dev
git pull origin dev

# Create a new feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add new feature description"

# Push to your fork
git push origin feature/your-feature-name
```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

**Examples:**
```
feat(auth): add password reset functionality
fix(job-search): resolve infinite loading state
docs(api): update authentication endpoints
test(components): add Button component tests
```

## Coding Standards

### TypeScript Guidelines

- **Use explicit types** for function parameters and return values
- **Avoid `any`** - use proper types or `unknown`
- **Use interfaces** for object shapes
- **Use type unions** for constrained values

```typescript
// ✅ Good
interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
}

function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  // Implementation
}

// ❌ Bad
function updateProfile(userId: any, updates: any): any {
  // Implementation
}
```

### React Component Guidelines

- **Use functional components** with hooks
- **Implement proper prop types** with TypeScript interfaces
- **Use descriptive component names**
- **Keep components focused** on a single responsibility

```typescript
// ✅ Good
interface UserCardProps {
  user: UserProfile
  onEdit?: (user: UserProfile) => void
  className?: string
}

export default function UserCard({ user, onEdit, className }: UserCardProps) {
  // Component implementation
}
```

### Styling Guidelines

- **Use Tailwind CSS** for styling
- **Follow mobile-first** responsive design
- **Use semantic class names** when creating custom CSS
- **Maintain consistent spacing** using Tailwind's spacing scale

```tsx
// ✅ Good
<div className="flex flex-col space-y-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
  <p className="text-gray-600">Description</p>
</div>
```

## Testing Guidelines

### Testing Strategy

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows (future)

### Writing Tests

```typescript
// ✅ Good test structure
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Button from '../Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Test Coverage Requirements

- **Minimum overall coverage**: 80%
- **Critical components**: 95% coverage
- **Utility functions**: 100% coverage

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**
   ```bash
   npm run test
   ```

2. **Run linting and formatting**
   ```bash
   npm run lint:fix
   npm run format
   ```

3. **Check TypeScript compilation**
   ```bash
   npm run type-check
   ```

4. **Test the build**
   ```bash
   npm run build
   ```

### Pull Request Template

When creating a pull request, please use this template:

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Added tests for new functionality

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] No new warnings introduced
- [ ] Tests added/updated
```

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one team member must approve
3. **Testing**: Manual testing may be required for UI changes
4. **Documentation**: Ensure documentation is updated if needed

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior**
4. **Actual behavior**
5. **Environment details** (browser, OS, etc.)
6. **Screenshots** if applicable

### Feature Requests

When requesting features, please include:

1. **Clear description** of the feature
2. **Use case** and motivation
3. **Proposed solution** (if you have one)
4. **Alternative solutions** considered

### Issue Labels

We use the following labels to categorize issues:

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `priority:high`: High priority issue
- `priority:medium`: Medium priority issue
- `priority:low`: Low priority issue

## Documentation

### Code Documentation

- **Use JSDoc comments** for functions and classes
- **Include examples** in documentation
- **Document complex logic** with inline comments
- **Keep README files updated**

```typescript
/**
 * Calculates the match score between user skills and job requirements
 * 
 * @param userSkills - Array of user's skills with proficiency levels
 * @param jobRequirements - Array of required skills for the job
 * @returns Match score between 0 and 1, where 1 is a perfect match
 * 
 * @example
 * ```typescript
 * const score = calculateMatchScore(
 *   [{ name: 'React', level: 4 }],
 *   ['React', 'TypeScript']
 * )
 * console.log(score) // 0.5
 * ```
 */
export function calculateMatchScore(
  userSkills: UserSkill[],
  jobRequirements: string[]
): number {
  // Implementation
}
```

### Documentation Updates

When making changes that affect:

- **API endpoints**: Update API documentation
- **Component interfaces**: Update component documentation
- **Configuration**: Update setup/deployment guides
- **New features**: Update user documentation

## Getting Help

If you need help or have questions:

1. **Check existing documentation** in the `docs/` folder
2. **Search existing issues** on GitHub
3. **Ask in discussions** on GitHub
4. **Contact maintainers** via email or GitHub

## Recognition

Contributors will be recognized in:

- **CONTRIBUTORS.md** file
- **Release notes** for significant contributions
- **GitHub contributors** section

Thank you for contributing to JobGenie! 🎉

---

**Last Updated**: January 2024  
**Version**: 1.0