# JobGenie Development Standards & Guidelines

## Table of Contents
1. [Code Style & Formatting](#code-style--formatting)
2. [TypeScript Guidelines](#typescript-guidelines)
3. [React Component Standards](#react-component-standards)
4. [State Management](#state-management)
5. [Testing Standards](#testing-standards)
6. [Performance Guidelines](#performance-guidelines)
7. [Security Best Practices](#security-best-practices)
8. [Git Workflow](#git-workflow)
9. [Documentation Standards](#documentation-standards)
10. [Code Review Process](#code-review-process)

## Code Style & Formatting

### ESLint Configuration
We use ESLint with TypeScript and React plugins for consistent code quality.

```json
{
  "extends": [
    "@eslint/js/recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier Configuration
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Naming Conventions

#### Files and Directories
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useAuth.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- **Directories**: kebab-case (e.g., `user-profile/`)

#### Variables and Functions
- **Variables**: camelCase (e.g., `userName`, `isLoading`)
- **Functions**: camelCase (e.g., `handleSubmit`, `fetchUserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- **Types/Interfaces**: PascalCase (e.g., `UserProfile`, `ApiResponse`)

## TypeScript Guidelines

### Interface Definitions
```typescript
// ✅ Good: Descriptive interface with proper documentation
interface UserProfile {
  /** Unique user identifier */
  id: string
  /** User's email address */
  email: string
  /** User's first name */
  firstName: string
  /** User's last name */
  lastName: string
  /** Optional job title */
  jobTitle?: string
  /** User's experience level */
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive'
  /** Profile creation timestamp */
  createdAt: Date
  /** Last profile update timestamp */
  updatedAt: Date
}

// ❌ Bad: Vague interface without documentation
interface User {
  id: string
  name: string
  data: any
}
```

### Type Safety
```typescript
// ✅ Good: Proper type definitions
type JobStatus = 'active' | 'closed' | 'draft'
type ApiResponse<T> = {
  data: T
  success: boolean
  message?: string
}

// ✅ Good: Generic function with constraints
function processApiResponse<T>(response: ApiResponse<T>): T | null {
  return response.success ? response.data : null
}

// ❌ Bad: Using 'any' type
function processData(data: any): any {
  return data.something
}
```

### Utility Types
```typescript
// ✅ Good: Using utility types for type transformations
type CreateUserRequest = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
type UpdateUserRequest = Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'jobTitle'>>
```

## React Component Standards

### Component Structure
```typescript
// ✅ Good: Well-structured component with proper typing
import { useState, useEffect } from 'react'
import { User, Mail, Phone } from 'lucide-react'
import Button from '../base/Button'
import { UserProfile } from '../../types/user'

interface UserProfileCardProps {
  /** User profile data */
  user: UserProfile
  /** Whether the profile is editable */
  isEditable?: boolean
  /** Callback when profile is updated */
  onUpdate?: (user: UserProfile) => void
  /** Additional CSS classes */
  className?: string
}

/**
 * UserProfileCard component displays user information in a card format
 * with optional editing capabilities.
 */
export default function UserProfileCard({
  user,
  isEditable = false,
  onUpdate,
  className = ''
}: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(user)

  useEffect(() => {
    setFormData(user)
  }, [user])

  const handleSave = async () => {
    try {
      // Save logic here
      onUpdate?.(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Component content */}
    </div>
  )
}
```

### Component Organization
```
src/components/
├── base/                    # Reusable UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   └── Input/
│       ├── Input.tsx
│       ├── Input.test.tsx
│       └── index.ts
└── feature/                 # Business logic components
    ├── UserProfile/
    │   ├── UserProfile.tsx
    │   ├── UserProfile.test.tsx
    │   ├── components/
    │   │   ├── ProfileCard.tsx
    │   │   └── ProfileForm.tsx
    │   └── index.ts
```

### Props Validation
```typescript
// ✅ Good: Comprehensive prop validation with TypeScript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant affecting visual style */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  /** Button size affecting padding and font */
  size?: 'sm' | 'md' | 'lg'
  /** Whether button is in loading state */
  loading?: boolean
  /** Icon to display before text */
  leftIcon?: ReactNode
  /** Icon to display after text */
  rightIcon?: ReactNode
}
```

### Custom Hooks
```typescript
// ✅ Good: Well-documented custom hook
/**
 * Custom hook for managing form state with validation
 * @param initialValues - Initial form values
 * @param validationSchema - Validation rules
 * @returns Form state and handlers
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: ValidationSchema<T>
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }, [errors])

  const validate = useCallback(() => {
    if (!validationSchema) return true
    
    const validationErrors = validationSchema.validate(values)
    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }, [values, validationSchema])

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    validate,
    setIsSubmitting
  }
}
```

## State Management

### Zustand Store Structure
```typescript
// ✅ Good: Well-structured Zustand store
interface AuthState {
  // State
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null

  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (userData: SignUpData) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
  
  // Internal actions (not exposed)
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isLoading: false,
      error: null,

      // Actions
      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const { user, session } = await AuthService.signIn({ email, password })
          set({ user, session, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Sign in failed',
            isLoading: false 
          })
          throw error
        }
      },

      signOut: async () => {
        set({ isLoading: true })
        try {
          await AuthService.signOut()
          set({ user: null, session: null, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      clearError: () => set({ error: null }),
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'jobgenie-auth',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
)
```

## Testing Standards

### Unit Testing with Vitest
```typescript
// ✅ Good: Comprehensive component test
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import Button from '../Button'

describe('Button Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state correctly', () => {
    render(<Button loading>Loading Button</Button>)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  describe('variants', () => {
    it.each([
      ['primary', 'bg-blue-600'],
      ['secondary', 'bg-gray-600'],
      ['outline', 'border-gray-300'],
      ['ghost', 'text-gray-600']
    ])('renders %s variant with correct classes', (variant, expectedClass) => {
      render(<Button variant={variant as any}>Test</Button>)
      expect(screen.getByRole('button')).toHaveClass(expectedClass)
    })
  })
})
```

### Integration Testing
```typescript
// ✅ Good: Integration test for user flow
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import AuthModal from '../AuthModal'
import * as AuthService from '../../services/authService'

// Mock the auth service
vi.mock('../../services/authService')

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('AuthModal Integration', () => {
  it('completes sign up flow successfully', async () => {
    const mockSignUp = vi.mocked(AuthService.signUp)
    mockSignUp.mockResolvedValue({
      user: { id: '1', email: 'test@example.com' },
      session: { access_token: 'token' }
    })

    const onSuccess = vi.fn()
    const user = userEvent.setup()

    renderWithRouter(
      <AuthModal 
        mode="signup" 
        isOpen={true} 
        onClose={() => {}} 
        onSuccess={onSuccess}
      />
    )

    // Fill out the form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create account/i }))

    // Wait for the API call and success callback
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      })
      expect(onSuccess).toHaveBeenCalled()
    })
  })
})
```

### Test Coverage Requirements
- **Minimum Coverage**: 80% overall
- **Critical Components**: 95% coverage
- **Utility Functions**: 100% coverage
- **API Services**: 90% coverage

## Performance Guidelines

### Code Splitting
```typescript
// ✅ Good: Lazy loading for route components
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'

const HomePage = lazy(() => import('../pages/home/page'))
const ProfilePage = lazy(() => import('../pages/profile/page'))

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Suspense>
  )
}
```

### Memoization
```typescript
// ✅ Good: Proper use of React.memo and useMemo
import { memo, useMemo } from 'react'

interface JobListProps {
  jobs: Job[]
  filters: JobFilters
}

const JobList = memo(function JobList({ jobs, filters }: JobListProps) {
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (filters.location && !job.location.includes(filters.location)) {
        return false
      }
      if (filters.remote && !job.isRemote) {
        return false
      }
      return true
    })
  }, [jobs, filters])

  return (
    <div>
      {filteredJobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
})
```

### Bundle Size Optimization
```typescript
// ✅ Good: Tree-shakable imports
import { format } from 'date-fns/format'
import { parseISO } from 'date-fns/parseISO'

// ❌ Bad: Importing entire library
import * as dateFns from 'date-fns'
```

## Security Best Practices

### Input Validation
```typescript
// ✅ Good: Comprehensive input validation
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
})

export function validateSignUpData(data: unknown) {
  return signUpSchema.safeParse(data)
}
```

### XSS Prevention
```typescript
// ✅ Good: Sanitizing user input
import DOMPurify from 'dompurify'

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  })
}

// ✅ Good: Safe rendering of user content
function UserBio({ bio }: { bio: string }) {
  const sanitizedBio = sanitizeHtml(bio)
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sanitizedBio }}
      className="user-bio"
    />
  )
}
```

### Environment Variables
```typescript
// ✅ Good: Proper environment variable handling
const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
}

// Validate required environment variables
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  throw new Error('Missing required environment variables')
}
```

## Git Workflow

### Branch Naming
- **Feature branches**: `feature/job-search-filters`
- **Bug fixes**: `fix/authentication-error`
- **Hotfixes**: `hotfix/security-patch`
- **Releases**: `release/v1.2.0`

### Commit Messages
Follow the Conventional Commits specification:

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

**Examples:**
```
feat(auth): add password reset functionality

fix(job-search): resolve infinite loading state

docs(api): update authentication endpoints

test(components): add Button component tests
```

### Pull Request Template
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

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] No new warnings introduced
```

## Documentation Standards

### Code Documentation
```typescript
/**
 * Calculates the match score between a user's skills and job requirements
 * 
 * @param userSkills - Array of user's skills with proficiency levels
 * @param jobRequirements - Array of required skills for the job
 * @param weights - Optional weights for different skill categories
 * @returns Match score between 0 and 1, where 1 is a perfect match
 * 
 * @example
 * ```typescript
 * const score = calculateMatchScore(
 *   [{ name: 'React', level: 4 }, { name: 'TypeScript', level: 5 }],
 *   ['React', 'TypeScript', 'Node.js']
 * )
 * console.log(score) // 0.67 (2 out of 3 skills match)
 * ```
 */
export function calculateMatchScore(
  userSkills: UserSkill[],
  jobRequirements: string[],
  weights?: SkillWeights
): number {
  // Implementation here
}
```

### README Structure
Each component/module should have a README with:
1. Purpose and overview
2. Installation/setup instructions
3. Usage examples
4. API documentation
5. Contributing guidelines
6. Changelog

## Code Review Process

### Review Checklist
- [ ] **Functionality**: Does the code work as intended?
- [ ] **Code Quality**: Is the code clean, readable, and maintainable?
- [ ] **Performance**: Are there any performance concerns?
- [ ] **Security**: Are there any security vulnerabilities?
- [ ] **Testing**: Are there adequate tests?
- [ ] **Documentation**: Is the code properly documented?
- [ ] **Standards**: Does the code follow our style guidelines?

### Review Guidelines
1. **Be Constructive**: Provide specific, actionable feedback
2. **Be Respectful**: Focus on the code, not the person
3. **Be Thorough**: Review both functionality and code quality
4. **Be Timely**: Complete reviews within 24 hours
5. **Ask Questions**: If something is unclear, ask for clarification

### Approval Process
- **2 Approvals Required**: For production code changes
- **1 Approval Required**: For documentation and test changes
- **Auto-merge**: For dependency updates (after CI passes)

---

**Document Version**: 1.0  
**Last Updated**: January 2024  
**Next Review**: March 2024