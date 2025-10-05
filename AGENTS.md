# Naboom NeighborNet Web Application - AGENTS.md

## Project Overview

Naboom NeighborNet is a comprehensive community security and neighborhood watch platform built with Vue 3, TypeScript, Tailwind CSS 4, and DaisyUI 5. This is the **frontend web application** that connects to a Django backend API to provide:

- **Emergency Response System (PANIC)**: One-tap emergency alerts with real-time monitoring
- **Community Hub**: Discussion forums, event management, and communication channels  
- **User Management & Profiles**: Extended member profiles with community groups and role management
- **Mobile-First Design**: Cross-platform responsive interface with PWA capabilities

The application serves South African communities with multilingual support (English/Afrikaans) and focuses on community safety, communication, and engagement.

## Technology Stack

- **Framework**: Vue 3 with Composition API + TypeScript
- **Styling**: Tailwind CSS 4 + DaisyUI 5 (custom Community Security themes)
- **Build Tool**: Vite 7+ with HMR
- **State Management**: Pinia with persisted state
- **Internationalization**: Vue I18n with locale routing
- **Maps**: MapLibre GL for incident tracking and vehicle monitoring
- **Testing**: Vitest + Vue Test Utils
- **Package Manager**: npm (Node.js 20.19.0+ or 22.12.0+)

## Project Structure and Module Organization

```
naboomneighbornet_web/
├── src/
│   ├── components/          # Reusable Vue components
│   │   ├── hub/            # Community hub specific components
│   │   ├── profile/        # User profile components
│   │   ├── AuthLayout.vue  # Authentication layout wrapper
│   │   ├── ThemeSwitcher.vue # Theme toggle component
│   │   └── LocaleNavigation.vue # Language switching
│   ├── pages/              # Route-level page components
│   │   ├── auth/           # Authentication pages (login, register)
│   │   ├── hub/            # Community hub pages
│   │   ├── Dashboard.vue   # Main dashboard
│   │   ├── SafeNaboom.vue  # Emergency response interface
│   │   └── Profile.vue     # User profile management
│   ├── stores/             # Pinia state management
│   │   ├── hub/            # Community hub stores
│   │   ├── auth.ts         # Authentication state
│   │   ├── theme.ts        # Theme management
│   │   ├── i18n.ts         # Internationalization state
│   │   ├── panic.ts        # Emergency response state
│   │   └── profile.ts      # User profile state
│   ├── router/             # Vue Router configuration
│   ├── services/           # API service classes
│   ├── types/              # TypeScript type definitions
│   ├── locales/            # i18n translation files
│   ├── utils/              # Utility functions and helpers
│   ├── composables/        # Vue composables for reusable logic
│   ├── plugins/            # Vue plugins (i18n, pinia)
│   ├── App.vue             # Root application component
│   ├── main.ts             # Application entry point
│   └── app.css             # Global styles with DaisyUI themes
├── public/                 # Static assets
├── backend_docs/           # API documentation
├── .codex/                 # Codex configuration
├── .cursor/rules           # Cursor IDE rules
└── package.json            # Dependencies and scripts
```

## Development Environment Setup

### Prerequisites
- Node.js 20.19.0 or >=22.12.0
- npm (comes with Node.js)
- Git for version control

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/knappy214/naboomneighbornet_web.git
cd naboomneighbornet_web

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration
- Copy `.env.example` to `.env` and configure API endpoints
- The app connects to a Django backend API (separate repository)
- Configure VITE_API_BASE_URL for backend communication

## Build and Development Commands

### Development
```bash
npm run dev              # Start Vite dev server with HMR
npm run dev -- --host    # Expose dev server to network
```

### Building and Testing
```bash
npm run build            # Production build (type-check + build)
npm run build-only       # Build without type checking
npm run preview          # Preview production build
npm run type-check       # Run TypeScript compiler check
```

### Code Quality
```bash
npm run lint             # ESLint with auto-fix
npm run format           # Prettier code formatting
npm run test:unit        # Run Vitest unit tests
```

### Dependency Management
```bash
npm run deps:check       # Check for outdated packages (dry-run)
npm run deps:update      # Update packages using update script
```

## Coding Style and Standards

### Vue 3 Composition API
- Use `<script setup>` syntax for all components
- Prefer Composition API over Options API
- Use TypeScript interfaces for prop definitions
- Implement proper reactivity with `ref()`, `reactive()`, `computed()`

### Component Architecture
- **Single File Components**: Use `.vue` files with `<template>`, `<script setup>`, `<style scoped>`
- **Component Naming**: PascalCase for components (e.g., `UserProfile.vue`)
- **Props**: Define with TypeScript interfaces and default values
- **Emits**: Explicitly define component events with type safety

### Styling Guidelines  
- **Tailwind CSS**: Utility-first approach for all styling
- **DaisyUI Components**: Use semantic component classes (e.g., `btn`, `card`, `hero`)
- **Custom Themes**: Leverage the Community Security light/dark theme system
- **Responsive Design**: Mobile-first with Tailwind responsive prefixes
- **CSS Custom Properties**: Use DaisyUI theme colors (`bg-base-100`, `text-base-content`)

### TypeScript Standards
- **Strict Mode**: Full TypeScript strict mode enabled
- **Type Definitions**: Create interfaces in `src/types/`
- **Imports**: Use path aliases (`@/` for `src/`)
- **API Types**: Define request/response interfaces for all API calls

### State Management with Pinia
- **Store Structure**: One store per domain (auth, theme, profile, etc.)
- **Composition Stores**: Use `setup` syntax with composables
- **Persistence**: Use `piniaPluginPersistedstate` for state persistence
- **Actions**: Async actions for API calls with proper error handling

## Internationalization (i18n)

### Locale Support
- **Primary**: English (en) - Default language
- **Secondary**: Afrikaans (af) - South African community support
- **Locale Files**: JSON format in `src/locales/`

### Translation Guidelines
- Use Vue I18n composable: `const { t } = useI18n()`
- Template usage: `{{ $t('key.path') }}`
- Parameterized translations: `$t('welcome.user', { name: userName })`
- Number/date formatting with locale awareness

## Testing Instructions

### Unit Testing with Vitest
```bash
npm run test:unit                    # Run all tests
npm run test:unit -- --watch        # Watch mode
npm run test:unit -- --coverage     # Coverage report
npx vitest run -t "ComponentName"   # Run specific test
```

### Test Structure
- **Location**: Tests in `src/__tests__/` or co-located `*.test.ts` files
- **Component Testing**: Use `@vue/test-utils` for component testing
- **Store Testing**: Test Pinia stores with `createPinia()`
- **API Testing**: Mock API calls with Vitest mocks

### Test Requirements
- All new components require unit tests
- API service functions must be tested
- Store actions and getters require test coverage
- Critical user flows need integration tests

## API Integration

### Service Architecture
- **Base Service**: `src/services/api.ts` with Axios configuration
- **Domain Services**: Separate services for auth, profile, panic, etc.
- **Type Safety**: All API calls use TypeScript interfaces
- **Error Handling**: Consistent error handling with toast notifications

### Available APIs
- **Authentication**: Login, register, JWT token management
- **Profile Management**: User profiles, groups, medical info
- **Panic System**: Emergency alerts, incident reporting
- **Community Hub**: Forums, events, messaging (planned)
- **Vehicle Tracking**: GPS monitoring (planned)

### API Configuration
```typescript
// Example service structure
class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse>
  async register(userData: RegisterRequest): Promise<User>
  async refreshToken(): Promise<TokenResponse>
}
```

## Theme Management

### DaisyUI Theme System
- **Light Theme**: Default clean, accessible interface
- **Business Theme**: Professional dark mode
- **Custom Themes**: Community Security branded colors
- **Theme Switching**: Persistent theme selection with `useThemeStore()`

### Theme Usage
```vue
<template>
  <!-- Use DaisyUI semantic classes -->
  <div class="bg-base-100 text-base-content">
    <button class="btn btn-primary">Primary Action</button>
    <div class="card bg-base-200">Card Content</div>
  </div>
</template>
```

## Security Considerations

### Authentication
- JWT tokens stored in secure HTTP-only cookies (backend implementation)
- Automatic token refresh handling
- Route guards for protected pages
- Session timeout management

### Data Protection
- No sensitive data in localStorage
- API endpoints use HTTPS in production
- Input validation on all forms
- XSS protection with proper data binding

### Environment Variables
- API endpoints in environment variables
- No secrets committed to version control
- Different configs for dev/staging/production

## Performance Guidelines

### Bundle Optimization
- **Tree Shaking**: Import only used components/utilities
- **Code Splitting**: Route-based lazy loading
- **Asset Optimization**: Vite automatic asset optimization
- **PWA Caching**: Service worker for offline capability

### Vue Performance
- **Component Optimization**: Use `defineAsyncComponent` for large components
- **Reactivity**: Avoid unnecessary reactive objects
- **v-memo**: Use for expensive list rendering
- **Teleport**: For modals and overlays

## Deployment and Build Process

### Production Build
```bash
npm run build        # Creates dist/ folder
npm run preview      # Test production build locally
```

### Build Outputs
- **Static Files**: Generated in `dist/` directory
- **Asset Optimization**: Vite handles CSS/JS minification
- **Progressive Web App**: Service worker for offline functionality
- **Environment**: Production environment variables

### Deployment Checklist
- [ ] Run `npm run lint` and fix all issues
- [ ] Run `npm run test:unit` and ensure all tests pass
- [ ] Run `npm run type-check` for TypeScript validation
- [ ] Test production build with `npm run preview`
- [ ] Verify environment variables are properly set
- [ ] Check that API endpoints are accessible

## Git Workflow and Commit Guidelines

### Branch Structure
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Feature development branches
- **hotfix/***: Critical production fixes

### Commit Message Format
```
feat: add emergency response component
fix: resolve theme switching issue  
docs: update API integration guide
style: improve responsive layout for mobile
refactor: optimize state management architecture
test: add unit tests for profile components
```

### Pull Request Process
- Create feature branch from `develop`
- Ensure all tests pass: `npm run test:unit`
- Run code quality checks: `npm run lint`
- Update documentation if needed
- Request code review before merging

## IDE and Tooling Configuration

### VS Code Extensions (Recommended)
- **Volar**: Vue 3 support and TypeScript integration
- **Tailwind CSS IntelliSense**: CSS class autocompletion
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript Importer**: Auto-import management

### Cursor AI Integration
- Configuration in `.cursor/rules` for AI-assisted development
- Custom rules for Vue/TypeScript patterns
- Component generation templates

### Debug Configuration
- Vite DevTools enabled in development
- Vue DevTools browser extension support
- Authentication debugging utilities in `utils/authDebug.ts`

## Common Development Patterns

### Component Composition
```vue
<script setup lang="ts">
// Props with TypeScript interface
interface Props {
  title: string
  items: Array<Item>
  loading?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits with type safety
const emit = defineEmits<{
  select: [item: Item]
  delete: [id: string]
}>()

// Composables for reusable logic
const { user } = useAuth()
const { t } = useI18n()
</script>
```

### Store Pattern
```typescript
// Pinia store with composition API
export const useFeatureStore = defineStore('feature', () => {
  const state = ref<FeatureState>({})
  
  const getters = computed(() => {
    return state.value.processed
  })
  
  const actions = {
    async fetchData() {
      // API call with error handling
    }
  }
  
  return { state, getters, ...actions }
}, {
  persist: true // Enable persistence
})
```

### Error Handling
- Use try/catch blocks for async operations
- Display user-friendly error messages with toast notifications
- Log errors for debugging in development
- Graceful fallbacks for network failures

## Troubleshooting Common Issues

### Development Server Issues
- **Port conflicts**: Use `npm run dev -- --port 3001`
- **Module resolution**: Clear `node_modules` and reinstall
- **TypeScript errors**: Run `npm run type-check` for detailed diagnostics

### Build Failures  
- Check Node.js version compatibility (20.19.0+ or 22.12.0+)
- Verify all dependencies are properly installed
- Clear Vite cache: `rm -rf node_modules/.vite`

### API Connection Issues
- Verify backend API is running and accessible
- Check environment variables in `.env`
- Use browser DevTools Network tab for debugging

This AGENTS.md file should be updated as the project evolves, especially when:
- New features or modules are added
- API endpoints change or expand  
- Development workflow is modified
- New coding patterns are established
- Build or deployment processes change