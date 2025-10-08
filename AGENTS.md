# Naboom NeighborNet Web Application

Naboom NeighborNet is the frontend for a community security and neighborhood watch platform. It serves South African communities in English and Afrikaans and integrates with a Django backend to power panic response, community engagement, and profile management.

## 1. Platform Snapshot
- Emergency panic trigger with live status tracking
- Community hub for forums, events, and messaging
- Extended user profiles with group and role administration
- Mobile-first UI with PWA enhancements

## 2. Technology Stack
- Framework: Vue 3 (Composition API, TypeScript)
- Styling: Tailwind CSS 4, DaisyUI 5 with community security themes
- Tooling: Vite 7+ (HMR), npm, Node 20.19.0 LTS or 22.12.0+
- State: Pinia with persisted state plugin
- i18n: Vue I18n with locale-aware routing
- Mapping: MapLibre GL for incident and vehicle tracking
- Testing: Vitest and Vue Test Utils

## 3. Repository Layout
```
naboomneighbornet_web/
|-- src/
|   |-- components/
|   |   |-- hub/
|   |   |-- profile/
|   |   |-- AuthLayout.vue
|   |   |-- ThemeSwitcher.vue
|   |   `-- LocaleNavigation.vue
|   |-- pages/
|   |   |-- auth/
|   |   |-- hub/
|   |   |-- Dashboard.vue
|   |   |-- SafeNaboom.vue
|   |   `-- Profile.vue
|   |-- stores/
|   |   |-- hub/
|   |   |-- auth.ts
|   |   |-- theme.ts
|   |   |-- i18n.ts
|   |   |-- panic.ts
|   |   `-- profile.ts
|   |-- router/
|   |-- services/
|   |-- types/
|   |-- locales/
|   |-- utils/
|   |-- composables/
|   |-- plugins/
|   |-- App.vue
|   |-- main.ts
|   `-- app.css
|-- public/
|-- backend_docs/
|-- .codex/
|-- .cursor/rules
`-- package.json
```

## 4. Environment Setup
### Prerequisites
- Node.js 20.19.0 or 22.12.0+
- npm (bundled with Node)
- Git

### First-Time Setup
```bash
git clone https://github.com/knappy214/naboomneighbornet_web.git
cd naboomneighbornet_web
npm install
cp .env.example .env
npm run dev
```

### Environment Notes
- Configure `VITE_API_BASE_URL` to point to the Django backend.
- Keep environment overrides in `.env.local` when needed.
- Ensure the backend repository is running and reachable for API calls.

## 5. Key npm Scripts
| Script | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server with hot module replacement. |
| `npm run dev -- --host` | Expose the dev server to the network. |
| `npm run build` | Type-check and build the production bundle. |
| `npm run build-only` | Build production bundle without type-checking. |
| `npm run preview` | Preview the production build locally. |
| `npm run type-check` | Execute the TypeScript compiler in project mode. |
| `npm run lint` | Run ESLint with autofix. |
| `npm run format` | Format code with Prettier. |
| `npm run test:unit` | Run Vitest unit tests. |
| `npm run deps:check` | Dry-run dependency updates. |
| `npm run deps:update` | Apply dependency updates through the update script. |

## 6. Coding Standards
### Vue Components
- Use `<script setup lang="ts">` and composition functions.
- Define props with TypeScript interfaces and defaults via `withDefaults`.
- Declare emits with typed signatures.
- Extract complex logic into composables stored in `src/composables`.

### Styling
- Favor Tailwind utility classes and DaisyUI semantics (`btn`, `card`, `alert`).
- Maintain responsive layouts with Tailwind breakpoints (`sm`, `md`, `lg`, `xl`).
- Extend themes through DaisyUI config and global CSS variables when necessary.

### TypeScript
- Strict mode is enabled; centralize shared types within `src/types`.
- Use the `@/` alias for imports instead of deep relative paths.
- Co-locate API DTO types with their services for maintainability.

### Pinia State
- Organize stores by domain (auth, panic, profile, hub, theme, i18n).
- Prefer setup-style `defineStore` definitions for better typing.
- Persist only non-sensitive data; avoid leaking tokens to storage.
- Wrap async actions in `try/catch` with UI-level error surfacing.

## 7. Internationalization
- Default locale: English (`en`); secondary locale: Afrikaans (`af`).
- Store translations in `src/locales/{en,af}.json`.
- Access translations via `const { t } = useI18n()` and template helper `$t`.
- Use descriptive keys and parameterized strings for dynamic content.

## 8. Testing Strategy
- Place tests in `src/__tests__/` or alongside components (`*.test.ts`).
- Use `@vue/test-utils` for component rendering and interaction.
- Initialize stores per test with `createPinia()` to avoid state bleed.
- Mock API services at the network boundary; do not call live endpoints.
- Run `npm run test:unit -- --coverage` when coverage data is required.

## 9. API Layer
- Shared Axios configuration lives in `src/services/api.ts`.
- Domain services cover authentication, profile, panic, hub, and planned vehicle tracking.
- Specify request and response contracts in TypeScript and export reusable types.
- Normalize errors and trigger user notifications with consistent copy.
- Handle tokens through HTTP-only cookies; never persist secrets in the frontend.

## 10. Theme Management
- Light theme is default; business/dark theme available through DaisyUI.
- `useThemeStore()` persists the active theme and toggles `data-theme`.
- Lean on DaisyUI tokens (`bg-base-200`, `text-primary`) for semantic colors.
- Test contrast across key views (dashboard, panic, hub) when adjusting themes.

## 11. Security Expectations
- Authentication relies on JWT with backend-managed refresh cycles.
- Route guards protect private areas; logout clears persisted Pinia state.
- Validate inputs client-side and rely on backend validation for enforcement.
- Only communicate with HTTPS endpoints in production.
- Sanitize any user-supplied HTML before rendering (prefer text binding).

## 12. Performance Guidelines
- Apply route-based code splitting through Vue Router dynamic imports.
- Lazy-load heavy components (maps, analytics) with `defineAsyncComponent`.
- Keep reactivity lean; avoid deep reactive objects when a `ref` suffices.
- Cache map and tracking data responsibly and throttle live polling.
- Inspect bundle composition with `npm run build -- --report` if size drifts.

## 13. Deployment Workflow
- Production assets are emitted to `dist/`.
- Before deployment run: `npm run lint`, `npm run test:unit`, `npm run type-check`, `npm run build`.
- Validate environment variables and API connectivity via `npm run preview`.
- Confirm service worker caching does not stale panic response data.

## 14. Git and Branching
- `main`: production-ready.
- `develop`: integration branch.
- `feature/*`: new feature development.
- `hotfix/*`: urgent fixes for production incidents.
- Follow Conventional Commit prefixes (`feat`, `fix`, `docs`, `refactor`, `style`, `test`).
- Open pull requests from feature branches into `develop`; require passing checks before merge.

## 15. Tooling and IDE Support
- Recommended VS Code extensions: Volar, Tailwind CSS IntelliSense, ESLint, Prettier, TypeScript Importer.
- Cursor AI automations live in `.cursor/rules` and align with Vue/TypeScript patterns.
- Enable Vite and Vue DevTools during development for debugging insight.
- `utils/authDebug.ts` contains helpers for authentication troubleshooting.

## 16. Reusable Patterns
### Component Blueprint
```vue
<script setup lang="ts">
interface Props {
  title: string;
  items: Item[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  (event: "select", item: Item): void;
  (event: "delete", id: string): void;
}>();

const { user } = useAuth();
const { t } = useI18n();
</script>
```

### Store Blueprint
```typescript
export const useFeatureStore = defineStore("feature", () => {
  const state = ref<FeatureState>({});

  const processed = computed(() => state.value.processed);

  async function fetchData() {
    try {
      // perform API call
    } catch (error) {
      // handle error gracefully
    }
  }

  return { state, processed, fetchData };
}, {
  persist: true,
});
```

### Error Handling
- Wrap async operations with `try/catch` and display user-friendly toasts.
- Log diagnostic details to the console during development only.
- Offer retry guidance or offline fallbacks when network requests fail.

## 17. Troubleshooting
- Dev server port conflict: `npm run dev -- --port 3001`.
- TypeScript issues: `npm run type-check` for detailed diagnostics.
- Build failures: confirm Node version and reinstall dependencies if required.
- API errors: verify backend availability and `VITE_API_BASE_URL` value.
- Vite cache problems: delete `node_modules/.vite` and restart the dev server.

## 18. Maintenance Tips
- Update this guide when features, workflows, or dependencies change.
- Sync documentation with backend updates referenced in `backend_docs/`.
- Record new testing requirements alongside feature delivery.
- Treat AGENTS.md as the onboarding entry point for contributors.
