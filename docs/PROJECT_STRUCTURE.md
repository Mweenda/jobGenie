# JobGenie Project Structure

## Overview

This document outlines the complete project structure for JobGenie, explaining the purpose and organization of each directory and file. The structure follows modern React/TypeScript best practices with clear separation of concerns.

## Root Directory Structure

```
jobgenie/
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── .prettierrc                  # Prettier configuration
├── README.md                    # Project overview and setup
├── index.html                   # HTML entry point
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── tsconfig.app.json            # App-specific TypeScript config
├── tsconfig.node.json           # Node-specific TypeScript config
├── vite.config.ts               # Vite build configuration
├── vitest.config.ts             # Vitest testing configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.ts            # PostCSS configuration
├── database/                    # Database schemas and migrations
├── docs/                        # Project documentation
├── public/                      # Static assets
└── src/                         # Source code
```

## Source Code Structure (`src/`)

```
src/
├── App.tsx                      # Root application component
├── main.tsx                     # Application entry point
├── index.css                    # Global styles
├── vite-env.d.ts               # Vite type definitions
├── components/                  # React components
├── pages/                       # Page-level components
├── hooks/                       # Custom React hooks
├── services/                    # API and business logic
├── store/                       # Global state management
├── utils/                       # Utility functions
├── lib/                         # Third-party integrations
├── types/                       # TypeScript type definitions
├── config/                      # Configuration files
├── router/                      # Routing configuration
├── i18n/                        # Internationalization
└── test/                        # Test utilities and setup
```

## Detailed Directory Breakdown

### `/components` - React Components

```
components/
├── base/                        # Reusable UI components
│   ├── Button/
│   │   ├── Button.tsx          # Button component
│   │   ├── Button.test.tsx     # Button tests
│   │   └── index.ts            # Export file
│   ├── Input/
│   │   ├── Input.tsx           # Input component
│   │   ├── Input.test.tsx      # Input tests
│   │   └── index.ts            # Export file
│   ├── Modal/
│   │   ├── Modal.tsx           # Modal component
│   │   ├── Modal.test.tsx      # Modal tests
│   │   └── index.ts            # Export file
│   └── index.ts                # Barrel export
├── feature/                     # Business logic components
│   ├── Header/
│   │   ├── Header.tsx          # Navigation header
│   │   ├── Header.test.tsx     # Header tests
│   │   ├── components/         # Sub-components
│   │   │   ├── NotificationDropdown.tsx
│   │   │   └── ProfileDropdown.tsx
│   │   └── index.ts            # Export file
│   ├── JobFeed/
│   │   ├── JobFeed.tsx         # Job listing component
│   │   ├── JobFeed.test.tsx    # Job feed tests
│   │   ├── components/         # Sub-components
│   │   │   ├── JobCard.tsx
│   │   │   ├── JobFilters.tsx
│   │   │   └── JobTabs.tsx
│   │   └── index.ts            # Export file
│   ├── AIChatbot/
│   │   ├── AIChatbot.tsx       # AI assistant component
│   │   ├── AIChatbot.test.tsx  # Chatbot tests
│   │   ├── components/         # Sub-components
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── JobRecommendations.tsx
│   │   └── index.ts            # Export file
│   └── index.ts                # Barrel export
├── ErrorBoundary.tsx           # Error boundary component
└── index.ts                    # Main components export
```

**Component Organization Principles:**
- **Base Components**: Generic, reusable UI components with no business logic
- **Feature Components**: Business-specific components with domain logic
- **Co-location**: Tests and sub-components are placed near their parent
- **Barrel Exports**: Each directory has an index.ts for clean imports

### `/pages` - Page Components

```
pages/
├── landing/                     # Landing page
│   ├── page.tsx                # Main landing page
│   ├── components/             # Landing-specific components
│   │   ├── AuthModal.tsx       # Authentication modal
│   │   ├── HeroSection.tsx     # Hero section
│   │   ├── FeaturesSection.tsx # Features showcase
│   │   └── CTASection.tsx      # Call-to-action
│   └── index.ts                # Export file
├── home/                        # Dashboard page
│   ├── page.tsx                # Main dashboard
│   ├── components/             # Dashboard-specific components
│   │   ├── DashboardStats.tsx  # Statistics overview
│   │   └── QuickActions.tsx    # Quick action buttons
│   └── index.ts                # Export file
├── profile/                     # User profile page
│   ├── page.tsx                # Main profile page
│   ├── components/             # Profile-specific components
│   │   ├── ProfileForm.tsx     # Profile editing form
│   │   ├── SkillsManager.tsx   # Skills management
│   │   └── ApplicationHistory.tsx # Application tracking
│   └── index.ts                # Export file
├── jobs/                        # Job-related pages
│   ├── search/
│   │   └── page.tsx            # Job search page
│   ├── details/
│   │   └── [id]/
│   │       └── page.tsx        # Job details page
│   └── applications/
│       └── page.tsx            # User applications
├── NotFound.tsx                # 404 error page
└── index.ts                    # Pages export
```

### `/services` - API and Business Logic

```
services/
├── authService.ts              # Authentication operations
├── jobService.ts               # Job-related operations
├── chatbotService.ts           # AI chatbot logic
├── userService.ts              # User profile operations
├── companyService.ts           # Company data operations
├── applicationService.ts       # Job application operations
├── notificationService.ts     # Notification handling
├── analyticsService.ts        # Analytics and tracking
├── uploadService.ts           # File upload operations
└── index.ts                   # Services export
```

**Service Responsibilities:**
- **API Communication**: HTTP requests to backend services
- **Data Transformation**: Converting API responses to frontend models
- **Business Logic**: Complex operations and calculations
- **Error Handling**: Consistent error processing
- **Caching**: Data caching strategies

### `/store` - State Management

```
store/
├── authStore.ts               # Authentication state
├── jobStore.ts                # Job-related state
├── userStore.ts               # User profile state
├── chatStore.ts               # Chat/messaging state
├── notificationStore.ts       # Notification state
├── uiStore.ts                 # UI state (modals, loading, etc.)
├── middleware/                # Store middleware
│   ├── logger.ts              # Logging middleware
│   ├── persistence.ts         # Persistence middleware
│   └── devtools.ts            # Development tools
└── index.ts                   # Store exports
```

**State Management Principles:**
- **Single Responsibility**: Each store manages one domain
- **Immutability**: State updates are immutable
- **Persistence**: Critical state is persisted to localStorage
- **DevTools**: Development tools integration for debugging

### `/hooks` - Custom React Hooks

```
hooks/
├── useAuth.ts                 # Authentication hook
├── useLocalStorage.ts         # Local storage hook
├── useDebounce.ts             # Debouncing hook
├── useInfiniteScroll.ts       # Infinite scrolling hook
├── useWebSocket.ts            # WebSocket connection hook
├── useForm.ts                 # Form state management hook
├── useApi.ts                  # API request hook
├── usePermissions.ts          # User permissions hook
├── useTheme.ts                # Theme management hook
└── index.ts                   # Hooks export
```

### `/utils` - Utility Functions

```
utils/
├── api.ts                     # API client configuration
├── date.ts                    # Date formatting utilities
├── format.ts                  # Text and number formatting
├── validation.ts              # Input validation helpers
├── storage.ts                 # Storage utilities
├── constants.ts               # Application constants
├── helpers.ts                 # General helper functions
├── types.ts                   # Utility types
└── index.ts                   # Utils export
```

### `/lib` - Third-party Integrations

```
lib/
├── supabase.ts                # Supabase client configuration
├── analytics.ts               # Analytics integration
├── monitoring.ts              # Error monitoring setup
├── auth.ts                    # Authentication provider setup
└── index.ts                   # Lib exports
```

### `/types` - TypeScript Definitions

```
types/
├── api.ts                     # API response types
├── auth.ts                    # Authentication types
├── job.ts                     # Job-related types
├── user.ts                    # User profile types
├── company.ts                 # Company types
├── chat.ts                    # Chat/messaging types
├── common.ts                  # Common/shared types
└── index.ts                   # Types export
```

### `/config` - Configuration Files

```
config/
├── env.ts                     # Environment configuration
├── constants.ts               # Application constants
├── routes.ts                  # Route definitions
├── theme.ts                   # Theme configuration
└── index.ts                   # Config exports
```

### `/router` - Routing Configuration

```
router/
├── config.tsx                 # Route configuration
├── guards.tsx                 # Route guards (auth, permissions)
├── routes.ts                  # Route definitions
└── index.ts                   # Router exports
```

### `/i18n` - Internationalization

```
i18n/
├── index.ts                   # i18n configuration
├── locales/                   # Translation files
│   ├── en/
│   │   ├── common.json        # Common translations
│   │   ├── auth.json          # Authentication translations
│   │   ├── jobs.json          # Job-related translations
│   │   └── index.ts           # English exports
│   └── es/                    # Spanish translations (future)
│       └── index.ts           # Spanish exports
└── utils.ts                   # i18n utilities
```

### `/test` - Testing Utilities

```
test/
├── setup.ts                   # Test environment setup
├── mocks/                     # Mock implementations
│   ├── api.ts                 # API mocks
│   ├── auth.ts                # Auth mocks
│   └── data.ts                # Test data
├── utils/                     # Test utilities
│   ├── render.tsx             # Custom render function
│   ├── factories.ts           # Data factories
│   └── helpers.ts             # Test helpers
└── __fixtures__/              # Test fixtures
    ├── users.json             # User test data
    ├── jobs.json              # Job test data
    └── companies.json         # Company test data
```

## Database Structure (`database/`)

```
database/
├── schema.sql                 # Complete database schema
├── migrations/                # Database migrations
│   ├── 001_initial_schema.sql
│   ├── 002_add_skills_table.sql
│   └── 003_add_notifications.sql
├── seeds/                     # Seed data for development
│   ├── companies.sql          # Sample companies
│   ├── jobs.sql               # Sample jobs
│   └── users.sql              # Sample users
└── docs/                      # Database documentation
    ├── ERD.md                 # Entity relationship diagram
    └── QUERIES.md             # Common queries
```

## Documentation Structure (`docs/`)

```
docs/
├── README.md                  # Documentation overview
├── TECHNICAL_DESIGN.md        # Technical design document
├── API_DOCUMENTATION.md       # API documentation
├── DEVELOPMENT_STANDARDS.md   # Development guidelines
├── PROJECT_STRUCTURE.md       # This document
├── DEPLOYMENT.md              # Deployment guide
├── CONTRIBUTING.md            # Contribution guidelines
├── CHANGELOG.md               # Version history
├── architecture/              # Architecture diagrams
│   ├── system-overview.png
│   ├── component-diagram.png
│   └── data-flow.png
└── examples/                  # Code examples
    ├── component-patterns.md
    ├── api-usage.md
    └── testing-patterns.md
```

## Public Assets (`public/`)

```
public/
├── favicon.ico                # Favicon
├── manifest.json              # Web app manifest
├── robots.txt                 # Search engine instructions
├── images/                    # Static images
│   ├── logo.svg               # Application logo
│   ├── hero-bg.jpg            # Hero background
│   └── icons/                 # Icon assets
│       ├── apple-touch-icon.png
│       └── android-chrome-192x192.png
└── fonts/                     # Custom fonts (if any)
    └── custom-font.woff2
```

## Configuration Files

### TypeScript Configuration
- **`tsconfig.json`**: Base TypeScript configuration
- **`tsconfig.app.json`**: Application-specific settings
- **`tsconfig.node.json`**: Node.js environment settings

### Build Configuration
- **`vite.config.ts`**: Vite build tool configuration
- **`vitest.config.ts`**: Testing framework configuration
- **`tailwind.config.ts`**: Tailwind CSS configuration
- **`postcss.config.ts`**: PostCSS processing configuration

### Code Quality
- **`.prettierrc`**: Code formatting rules
- **`.eslintrc.json`**: Linting rules and configuration
- **`.gitignore`**: Git ignore patterns

## Import Patterns

### Absolute Imports
```typescript
// ✅ Good: Absolute imports from src root
import Button from 'components/base/Button'
import { useAuth } from 'hooks/useAuth'
import { JobService } from 'services/jobService'
import { formatDate } from 'utils/date'
```

### Barrel Exports
```typescript
// components/base/index.ts
export { default as Button } from './Button'
export { default as Input } from './Input'
export { default as Modal } from './Modal'

// Usage
import { Button, Input, Modal } from 'components/base'
```

### Type Imports
```typescript
// ✅ Good: Explicit type imports
import type { User } from 'types/user'
import type { ApiResponse } from 'types/api'
```

## File Naming Conventions

### Components
- **React Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Component Tests**: PascalCase with `.test.tsx` (e.g., `UserProfile.test.tsx`)
- **Component Styles**: PascalCase with `.module.css` (e.g., `UserProfile.module.css`)

### Non-Components
- **Hooks**: camelCase starting with "use" (e.g., `useAuth.ts`)
- **Services**: camelCase with "Service" suffix (e.g., `authService.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Types**: camelCase (e.g., `userTypes.ts`)
- **Constants**: camelCase or UPPER_SNAKE_CASE (e.g., `apiConstants.ts`)

### Directories
- **All directories**: kebab-case (e.g., `user-profile/`, `job-search/`)
- **Exception**: Component directories use PascalCase (e.g., `Button/`, `UserProfile/`)

## Best Practices

### Component Organization
1. **Co-location**: Keep related files close together
2. **Single Responsibility**: Each component has one clear purpose
3. **Composition**: Prefer composition over inheritance
4. **Reusability**: Base components are highly reusable

### State Management
1. **Domain Separation**: Each store manages one business domain
2. **Minimal State**: Keep only necessary data in global state
3. **Derived State**: Compute derived values rather than storing them
4. **Immutability**: Always update state immutably

### Testing Strategy
1. **Test Pyramid**: More unit tests, fewer integration tests
2. **Co-location**: Tests live next to the code they test
3. **Realistic Data**: Use factories and fixtures for test data
4. **Behavior Testing**: Test behavior, not implementation

### Performance Considerations
1. **Code Splitting**: Lazy load pages and large components
2. **Bundle Analysis**: Regular bundle size monitoring
3. **Memoization**: Use React.memo and useMemo appropriately
4. **Asset Optimization**: Optimize images and fonts

---

This project structure provides a solid foundation for a scalable, maintainable React application with clear separation of concerns and modern development practices.

**Document Version**: 1.0  
**Last Updated**: January 2024  
**Next Review**: March 2024