# React & TypeScript Project Guidelines - FINAL

> Coding standards for this repository. Reference for manual development and AI Agents (Copilot, Cursor, etc.).
>
> **Stack:** React 18 · TypeScript 5 · Redux Toolkit · React Router 7 · Formik + Yup · Rsbuild · SCSS · Prettier · ESLint Flat Config

---

## Table of Contents

1. [TypeScript & Type Safety](#1-typescript--type-safety)
2. [React Component Architecture](#2-react-component-architecture)
3. [State Management & Hooks](#3-state-management--hooks)
4. [Error Handling](#4-error-handling)
5. [Performance Standards](#5-performance-standards)
6. [Styling & UI](#6-styling--ui)
7. [Security](#7-security)
8. [Naming Conventions](#8-naming-conventions)
9. [API & Service Layer](#9-api--service-layer)
10. [Code Quality & Best Practices](#10-code-quality--best-practices)
11. [Assets & Image Optimization](#11-assets--image-optimization)

---

## 1. TypeScript & Type Safety

| Rule                        | Severity     | Detail                                                                                                                       |
| --------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **No `any`**                | 🔴 Error     | Strictly prohibited. Use `unknown`, generics, or specific interfaces. ESLint enforces `@typescript-eslint/no-explicit-any`.  |
| **Interfaces over Types**   | 🟡 Preferred | Use `interface` for component Props and public APIs. Use `type` for unions, intersections, mapped/utility types.             |
| **Explicit Return Types**   | 🔴 Error     | All exported functions, hooks, and service calls must have explicit return types. Internal one-liners may rely on inference. |
| **Readonly Props**          | 🟡 Preferred | Use `Readonly<Props>` for component props to prevent accidental mutation.                                                    |
| **Consistent Type Imports** | 🔴 Error     | Use `import type { X }` for type-only imports. Enforced by `@typescript-eslint/consistent-type-imports`.                     |
| **No Non-Null Assertions**  | 🟡 Preferred | Avoid `!` postfix. Use optional chaining (`?.`), nullish coalescing (`??`), or type guards instead.                          |
| **Discriminated Unions**    | 🟡 Preferred | For API responses with success/error variants, use discriminated unions over type casting.                                   |
| **Enums**                   | 🟡 Preferred | Use `const enum` or string literal unions. Avoid numeric enums (they produce runtime code and are less readable).            |

```typescript
// ✅ Good — discriminated union
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: WebHttpError }

// ❌ Bad — casting
const res = (await actions.init(body)) as IInitResponse
```

---

## 2. React Component Architecture

### 2.1 Component Style

- **Functional Components only.** Class components are prohibited for new code.
- Use arrow function syntax with explicit typing:

```typescript
// ✅ Good
const LoginPage: React.FC<LoginPageProps> = ({ onSubmit }) => { ... }

// ❌ Bad — class component
class LoginPage extends React.Component<Props, State> { ... }
```

### 2.2 Component Rules

| Rule                              | Detail                                                                                               |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Props Destructuring**           | Destructure props in the function signature, not in the body.                                        |
| **Single Responsibility**         | A component does ONE thing. If `render()` exceeds ~120 lines, split it.                              |
| **Composition over Inheritance**  | Use children, render props, or hooks — never class inheritance.                                      |
| **Avoid Inline Functions in JSX** | Extract handlers to named functions or `useCallback` to prevent unnecessary re-renders.              |
| **Self-Closing Tags**             | Use `<Component />` for elements without children. Enforced by ESLint.                               |
| **Fragment Shorthand**            | Use `<>...</>` instead of `<React.Fragment>` unless a key is needed.                                 |
| **Conditional Rendering**         | Prefer early returns and ternaries. Avoid deeply nested `&&` chains (risk of rendering `0` or `""`). |

### 2.3 File Organization Within a Component File

```
1. Imports (sorted by eslint-plugin-simple-import-sort)
2. Type/Interface definitions (Props, State)
3. Constants (component-scoped)
4. Component definition
5. Helper functions (non-exported, component-specific)
6. Redux connectors / HOC wrappers (default export at bottom)
```

---

## 3. State Management & Hooks

### 3.1 State Principles

- **Local first.** Use `useState`/`useReducer` by default. Lift to Redux only when state is shared by 3+ disconnected components or must persist across routes.
- **Derive, don't store.** If a value can be computed from existing state or props, compute it — don't add another `useState`.
- **Single source of truth.** Never duplicate Redux state in local component state.

### 3.2 Hook Rules

| Rule                                    | Detail                                                                                         |
| --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Dependency Arrays**                   | Never suppress `react-hooks/exhaustive-deps`. All referenced values must be listed.            |
| **Custom Hooks for Logic**              | Extract complex business logic, data fetching, and side effects into custom hooks (`use*.ts`). |
| **Avoid `useEffect` for Derived State** | Don't `useEffect` → `setState`. Compute during render or use `useMemo`.                        |
| **Cleanup Side Effects**                | Every `useEffect` with subscriptions, timers, or listeners must return a cleanup function.     |

```typescript
// ✅ Good — extract business logic into a custom hook
// src/Hooks/useLoginForm.ts
const useLoginForm = (): IUseLoginFormReturn => {
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(isServiceLoading('login'))

  const handleSubmit = useCallback((values: ILoginFormValues): void => {
    dispatch(loginAction(values))
  }, [dispatch])

  const handleOtpResend = useCallback((): void => {
    dispatch(resendOtpAction())
  }, [dispatch])

  return { isLoading, handleSubmit, handleOtpResend }
}

// src/Pages/Login.Page.tsx — component stays focused on rendering
const LoginPage: React.FC = () => {
  const { isLoading, handleSubmit, handleOtpResend } = useLoginForm()

  return (
    <DsBox>
      <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
      <DsButton onClick={handleOtpResend}>Resend OTP</DsButton>
    </DsBox>
  )
}

// ❌ Bad — business logic mixed into the component
const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(isServiceLoading('login'))

  const handleSubmit = useCallback((values: ILoginFormValues): void => {
    dispatch(loginAction(values))
  }, [dispatch])

  const handleOtpResend = useCallback((): void => {
    dispatch(resendOtpAction())
  }, [dispatch])

  return (
    <DsBox>
      <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
      <DsButton onClick={handleOtpResend}>Resend OTP</DsButton>
    </DsBox>
  )
}
```

### 3.3 Redux Conventions (Redux Toolkit)

| Rule                       | Detail                                                                                                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`createSlice`**          | All new reducers must use `createSlice`. No hand-written action creators and reducers.                                                                     |
| **Immutability via Immer** | RTK uses Immer internally — write "mutative" code inside reducers, but never mutate state outside of them.                                                 |
| **Selectors**              | Colocate selectors with slices. Use `createSelector` for derived/computed data.                                                                            |
| **Async Logic**            | Use `serviceActionCreatorWithTokenRotation` for async service calls. Each service handles its own loading, success, and error states via `ServiceTracker`. |
| **Typed Hooks**            | Use project-typed hooks (`useAppSelector`, `useAppDispatch` from `~/src/Hooks/useStore.ts`) instead of raw `useSelector`/`useDispatch`.                    |

---

## 4. Error Handling

| Rule                          | Detail                                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Error Boundaries**          | Every route-level page must be wrapped in an Error Boundary.                                                                  |
| **User-Facing Errors**        | Always map technical errors to user-friendly messages. Never expose stack traces, error codes, or internal details to the UI. |
| **Centralized Error Mapping** | Use `ERROR_MAPPER` / `ERROR_MAP` constants for consistent error code → UI message mapping.                                    |
| **Logging**                   | Use the project's `logError` service for error reporting. Never use `console.log/error` in production code.                   |
| **Retry Logic**               | Retry transient failures (network, 5xx) a maximum of 2 times with backoff. Do not retry 4xx client errors.                    |

---

## 5. Performance Standards

| Rule                       | Detail                                                                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Memoization**            | Use `useMemo` for expensive computations. Use `useCallback` for functions passed to memoized children. Do NOT memoize everything — only when profiling shows a need. |
| **`React.memo`**           | Wrap pure presentational components that receive complex props and re-render frequently.                                                                             |
| **Key Selection**          | Never use array `index` as a `key` for lists that can reorder, filter, or change. Use a stable unique ID.                                                            |
| **Lazy Loading**           | All route-level pages must use `React.lazy` + `Suspense` for code splitting.                                                                                         |
| **Bundle Size**            | Import only what you need from libraries (`import debounce from 'lodash/debounce'` not `import { debounce } from 'lodash'`).                                         |
| **Image Optimization**     | Use rspack image optimization with src constants. Serve responsive images with `srcSet`. Lazy-load below-the-fold images.                                            |
| **Avoid Layout Thrashing** | Do not read DOM geometry (e.g., `getBoundingClientRect`) and write styles in the same synchronous block.                                                             |
| **Web Vitals**             | Target: LCP < 2.5s, FID < 100ms, CLS < 0.1. Monitor via Dynatrace.                                                                                                   |

---

## 6. Styling & UI

### 6.1 Design System Variables - Colors

**NEVER hardcode colors.** Always use CSS variables from the design system.

#### Action Colors (Clickable Components)

```typescript
// ✅ Good — use design system color variables
const Button = styled.button`
  background: var(
    --ds-colour-actionPrimary
  ); // #97144D (light/dark/high-contrast)
  color: var(--ds-colour-typoPrimary);
  border: 1px solid var(--ds-colour-strokeDefault);
`

// ❌ Bad — hardcoded colors
const Button = styled.button`
  background: '#97144D';
  color: '#282828';
  border: '1px solid #E2E2E2';
`
```

Available action colors:

- `var(--ds-colour-actionPrimary)` → #97144D
- `var(--ds-colour-actionSecondary)` → #ED1164
- `var(--ds-colour-actionTertiary)` → #0C746C

#### Surface Colors (Non-clickable Background)

```typescript
// ✅ Good
const Card = styled.div`
  background: var(--ds-colour-surfaceBackground); // Primary background
  border: 1px solid var(--ds-colour-strokeDefault);
`

const Container = styled.div`
  background: var(--ds-colour-surfacePrimary); // Secondary background
`

// ❌ Bad
const Card = styled.div`
  background: '#FFFFFF';
  border: '1px solid #E2E2E2';
`
```

Available surface colors:

- `var(--ds-colour-surfaceBackground)` → #FFFFFF (light), #282828 (dark)
- `var(--ds-colour-surfacePrimary)` → #FFFFFF (light), #000000 (dark)
- `var(--ds-colour-surfaceSecondary)` → #F9F9F9 (light), #404040 (dark)
- `var(--ds-colour-surfaceTertiary)` → #404040 (light), #F9F9F9 (dark)

#### Typography Colors

```typescript
// ✅ Good — semantic color usage
const Text = styled.p`
  color: var(--ds-colour-typoPrimary); // Primary text
`

const SecondaryText = styled.span`
  color: var(--ds-colour-typoSecondary); // Secondary/muted text
`

const DisabledText = styled.span`
  color: var(--ds-colour-typoDisabled); // Disabled state
`

// ❌ Bad
const Text = styled.p`
  color: '#282828';
`
```

Available typography colors:

- `var(--ds-colour-typoPrimary)` → #282828 (light), #F9F9F9 (dark)
- `var(--ds-colour-typoSecondary)` → #575757 (light), #E2E2E2 (dark)
- `var(--ds-colour-typoTertiary)` → #6E6E6E (light), #B4B4B4 (dark)
- `var(--ds-colour-typoDisabled)` → #B4B4B4 (light), #9D9D9D (dark)

#### Icon Colors

```typescript
// ✅ Good — use icon color variables
const IconWrapper = styled.div`
  color: var(--ds-colour-iconActionPrimary);
`

const NegativeIcon = styled.svg`
  fill: var(--ds-colour-iconNegative); // Error/negative
`

const PositiveIcon = styled.svg`
  fill: var(--ds-colour-iconPositive); // Success/positive
`

const WarningIcon = styled.svg`
  fill: var(--ds-colour-iconWarning); // Warning
`
```

Available icon colors:

- `var(--ds-colour-iconNegative)` → #EB0000 (light), #FF6C6C (dark)
- `var(--ds-colour-iconPositive)` → #278829 (light), #62D264 (dark)
- `var(--ds-colour-iconWarning)` → #D84008 (light), #F87647 (dark)
- `var(--ds-colour-iconActionPrimary)` → #97144D
- `var(--ds-colour-iconDisabled)` → #B4B4B4 (light), #9D9D9D (dark)
- `var(--ds-colour-iconDefault)` → #FFFFFF

#### Stroke Colors (Borders)

```typescript
// ✅ Good — use stroke variables for borders
const Input = styled.input`
  border: 1px solid var(--ds-colour-strokeDefault);

  &:hover {
    border-color: var(--ds-colour-strokeHover);
  }

  &:disabled {
    border-color: var(--ds-colour-strokeDisabled);
  }
`

const SelectedElement = styled.div`
  border: 2px solid var(--ds-colour-strokeSelected);
`
```

Available stroke colors:

- `var(--ds-colour-strokeDefault)` → #E2E2E2 (light), #6E6E6E (dark)
- `var(--ds-colour-strokeSelected)` → #F14687 (light), #F57BA9 (dark)
- `var(--ds-colour-strokeHover)` → #81C1BD (light), #B8DDDB (dark)
- `var(--ds-colour-strokeDisabled)` → #B4B4B4 (light), #9D9D9D (dark)
- `var(--ds-colour-strokeActive)` → #404040 (light), #F9F9F9 (dark)

#### Support Colors (Status & Information)

```typescript
// ✅ Good — semantic status colors
const ErrorMessage = styled.div`
  color: var(--ds-colour-supportNegative); // Errors/critical
  background: var(--ds-colour-supportNegativeNeutral);
`

const SuccessMessage = styled.div`
  color: var(--ds-colour-supportPositive); // Success
  background: var(--ds-colour-supportPositiveNeutral);
`

const WarningMessage = styled.div`
  color: var(--ds-colour-supportWarning); // Warnings
  background: var(--ds-colour-supportWarningNeutral);
`
```

Available support colors:

- `var(--ds-colour-supportNegative)` → #EB0000 (light), #FF6C6C (dark)
- `var(--ds-colour-supportPositive)` → #278829 (light), #62D264 (dark)
- `var(--ds-colour-supportWarning)` → #D84008 (light), #F87647 (dark)

#### State Colors

```typescript
// ✅ Good — use state colors for interactions
const Checkbox = styled.input`
  &:checked {
    background: var(--ds-colour-stateSelectedPrimaryPressed);
  }

  &:hover {
    background: var(--ds-colour-stateSelectedPrimaryHover);
  }
`

const DisabledButton = styled.button`
  background: var(--ds-colour-stateDisabledSurface);
  cursor: not-allowed;
`
```

Available state colors:

- `var(--ds-colour-stateSelectedPrimaryHover)` → rgba(241,70,135,0.08)
- `var(--ds-colour-stateSelectedPrimaryPressed)` → #F9B0CC
- `var(--ds-colour-stateSelectedVisitedTextLink)` → #9911ED
- `var(--ds-colour-stateDisabledSurface)` → #F1F1F1 (light), #404040 (dark)

#### Overlay Colors

```typescript
// ✅ Good — modals and overlays
const Modal = styled.div`
  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background: var(--ds-colour-overlay); // Modal scrim: rgba(0,0,0,0.5)
  }
`

const LoadingOverlay = styled.div`
  background: var(
    --ds-colour-overlayLoader
  ); // Loading overlay: rgba(0,0,0,0.3)
`
```

#### Neutral Colors (Surface Backgrounds)

```typescript
// ✅ Good — subtle background variations
const NeutralContainer = styled.div`
  background: var(--ds-colour-neutral1); // Subtle background
`

const SubtleSection = styled.div`
  background: var(--ds-colour-neutral2); // Another shade
`
```

### 6.2 Design System Variables - Spacing

**NEVER hardcode spacing values.** Always use spacing variables.

```typescript
// ✅ Good — use spacing variables
const Container = styled.div`
  padding: var(--ds-spacing-bitterCold); // 16px / 1rem
  margin-bottom: var(--ds-spacing-mild); // 24px / 1.5rem
  gap: var(--ds-spacing-cool); // 20px / 1.25rem
`

const Button = styled.button`
  padding: var(--ds-spacing-frostbite) var(--ds-spacing-bitterCold); // 12px 16px
  margin: var(--ds-spacing-quickFreeze); // 4px
`

// ❌ Bad — hardcoded values
const Container = styled.div`
  padding: 16px;
  margin-bottom: 24px;
  gap: 20px;
`
```

Available spacing variables:

| Pixel | Rem   | Variable                        |
| ----- | ----- | ------------------------------- |
| 0px   | 0     | `var(--ds-spacing-zero)`        |
| 2px   | 0.125 | `var(--ds-spacing-deepFreeze)`  |
| 4px   | 0.25  | `var(--ds-spacing-quickFreeze)` |
| 8px   | 0.5   | `var(--ds-spacing-glacial)`     |
| 12px  | 0.75  | `var(--ds-spacing-frostbite)`   |
| 16px  | 1     | `var(--ds-spacing-bitterCold)`  |
| 20px  | 1.25  | `var(--ds-spacing-cool)`        |
| 24px  | 1.5   | `var(--ds-spacing-mild)`        |
| 28px  | 1.75  | `var(--ds-spacing-pleasant)`    |
| 32px  | 2     | `var(--ds-spacing-warm)`        |
| 36px  | 2.25  | `var(--ds-spacing-tepid)`       |
| 40px  | 2.5   | `var(--ds-spacing-tropical)`    |
| 44px  | 2.75  | `var(--ds-spacing-hot)`         |
| 48px  | 3     | `var(--ds-spacing-blazing)`     |
| 64px  | 4     | `var(--ds-spacing-molten)`      |
| 80px  | 5     | `var(--ds-spacing-superheated)` |
| 96px  | 6     | `var(--ds-spacing-meltdown)`    |
| 112px | 7     | `var(--ds-spacing-whiteHot)`    |
| 128px | 8     | `var(--ds-spacing-plasma)`      |

### 6.3 Design System Variables - Border Radius

**NEVER hardcode border radius.** Always use radius variables.

```typescript
// ✅ Good — use radius variables
const Button = styled.button`
  border-radius: var(--ds-radius-frostbite); // 12px
`

const Card = styled.div`
  border-radius: var(--ds-radius-bitterCold); // 16px
`

const Pill = styled.div`
  border-radius: var(--ds-radius-mild); // 24px
`

// ❌ Bad — hardcoded values
const Button = styled.button`
  border-radius: 12px;
`
```

Available radius variables:

| Value | Variable                       |
| ----- | ------------------------------ |
| 0px   | `var(--ds-radius-zero)`        |
| 2px   | `var(--ds-radius-deepFreeze)`  |
| 4px   | `var(--ds-radius-quickFreeze)` |
| 8px   | `var(--ds-radius-glacial)`     |
| 12px  | `var(--ds-radius-frostbite)`   |
| 16px  | `var(--ds-radius-bitterCold)`  |
| 20px  | `var(--ds-radius-cool)`        |
| 24px  | `var(--ds-radius-mild)`        |
| 28px  | `var(--ds-radius-pleasant)`    |

### 6.4 Responsive Design: Mobile & Desktop

Use the `withBreakpoints` HOC and `getDeviceActiveScreen` utility from the design system for responsive logic in components:

```typescript
// ✅ Good — use withBreakpoints HOC + getDeviceActiveScreen utility
import type { IwithBreakpoints } from '@am92/react-design-system'
import { DsStack, withBreakpoints } from '@am92/react-design-system'

import { getDeviceActiveScreen } from '~/src/Utils/screenSize'

interface IMyComponentProps extends IwithBreakpoints {}

const MyComponent: React.FC<IMyComponentProps> = ({ breakpoints }) => {
  const { isMobile } = getDeviceActiveScreen(breakpoints)

  return (
    <DsStack
      padding={{
        xs: 'var(--ds-spacing-bitterCold)',
        md: 'var(--ds-spacing-mild)'
      }}
      gap={{
        xs: 'var(--ds-spacing-glacial)',
        md: 'var(--ds-spacing-cool)'
      }}
    >
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </DsStack>
  )
}

export default withBreakpoints(MyComponent)

// ❌ Bad — ignores mobile responsiveness
const Container = styled.div`
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
`
```

For SCSS files, use standard media queries with design system spacing:

```scss
// ✅ Good — responsive SCSS
.container {
  padding: var(--ds-spacing-bitterCold);

  @media (min-width: 768px) {
    padding: var(--ds-spacing-mild);
  }
}
```

### 6.5 Design System Components

| Rule                    | Detail                                                               | Severity     |
| ----------------------- | -------------------------------------------------------------------- | ------------ |
| **Design System First** | Use `@am92/react-design-system` components before building custom UI | 🔴 Error     |
| **No Custom Styles**    | Don't override design system styles unless absolutely necessary      | 🟡 Preferred |

```typescript
// ✅ Good — use design system components (all exports use Ds prefix)
import { DsBox, DsButton, DsTextField, DsTypography } from '@am92/react-design-system'

const LoginForm = () => {
  return (
    <DsBox>
      <DsTextField label="Email" />
      <DsButton variant="primary">Sign In</DsButton>
    </DsBox>
  )
}

// ❌ Bad — custom elements
const LoginForm = () => {
  return (
    <div style={{ border: '1px solid #E2E2E2', padding: '16px' }}>
      <input type="text" placeholder="Email" />
      <button style={{ background: '#97144D', color: 'white' }}>Sign In</button>
    </div>
  )
}
```

---

## 7. Security

| Rule                             | Detail                                                                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **No `dangerouslySetInnerHTML`** | Prohibited unless content is sanitized with DOMPurify or equivalent.                                                        |
| **XSS Prevention**               | Never interpolate user input directly into the DOM. React's JSX escaping handles most cases — do not bypass it.             |
| **Sensitive Data**               | Never log, store in local storage, or expose tokens, PII, or credentials in client-side code.                               |
| **`rel="noreferrer"`**           | All external links with `target="_blank"` must include `rel="noreferrer"`. Enforced by `react/jsx-no-target-blank`.         |
| **CSP Compliance**               | All scripts and styles must comply with the project's Content Security Policy (`csp.config.ts`). No inline scripts.         |
| **Dependency Auditing**          | Run `npm audit` regularly. No `critical` or `high` vulnerabilities in production dependencies.                              |
| **Environment Variables**        | Access environment config only through `~/src/Configurations/env.ts`. Never reference `process.env` directly in components. |

---

## 8. Naming Conventions

| Entity                  | Convention                                                         | Example                                   |
| ----------------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| **Components**          | `PascalCase.tsx`                                                   | `OtpStagger.tsx`, `CommonErrorDialog.tsx` |
| **Page Components**     | `PascalCase.Page.tsx`                                              | `Login.Page.tsx`, `Home.Page.tsx`         |
| **Custom Hooks**        | `useCamelCase.ts`                                                  | `useIdle.ts`, `useStore.ts`               |
| **Utilities**           | `camelCase.util.ts`                                                | `storeAccessHelper.util.ts`               |
| **Redux Slices**        | `PascalCase/` folder with `Selectors.ts`, `Actions.ts`, `TYPES.ts` | `Redux/Application/`                      |
| **Services**            | `camelCase.Service.ts`                                             | `init.Service.ts`                         |
| **Constants**           | `UPPER_SNAKE_CASE.ts`                                              | `APP_ROUTES.ts`, `ERROR_CODES.ts`         |
| **Interfaces**          | `I` prefix for component/public interfaces                         | `IHomePageProps`                          |
| **Type aliases**        | `T` prefix                                                         | `TAppDispatch`, `TAppStore`               |
| **Enums**               | `E` prefix with PascalCase members                                 | `EPageToShow`                             |
| **Boolean Props/State** | `is`, `has`, `should` prefix                                       | `isLoading`, `hasError`, `shouldNavigate` |
| **Event Handlers**      | `handle` prefix (internal), `on` prefix (props)                    | `handleClick`, `onSubmit`                 |

---

## 9. API & Service Layer

| Rule                              | Detail                                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Service Abstraction**           | All API calls go through the service layer (`Redux/<Domain>/Services/`). Components never call HTTP clients directly.                      |
| **Request/Response Types**        | Every service must have typed request and response interfaces.                                                                             |
| **Error Typing**                  | Use `WebHttpError` from `@am92/web-http` for error responses. Never use `any` or `unknown` for error objects without narrowing.            |
| **Loading States**                | Track via `ServiceTracker` Redux slice using `isServiceLoading` selector.                                                                  |
| **No Business Logic in Services** | Services are pure data fetchers. Business logic belongs in Redux thunks, hooks, or utility functions.                                      |
| **Timeout & Retry**               | Configure at the HTTP client level (`WebHttp` config). Individual services should not implement their own retry unless the UX requires it. |

---

## 10. Code Quality & Best Practices

### 10.1 Click Handlers & Event Functions

| Rule                               | Detail                                                                            | Severity |
| ---------------------------------- | --------------------------------------------------------------------------------- | -------- |
| **Wrapper functions for handlers** | Click events should call a named wrapper function, not inline logic               | 🔴 Error |
| **Callback abstraction**           | All event handlers should be extracted to named functions for clarity and testing | 🔴 Error |

```typescript
// ✅ Good — wrapper function
const handleDeleteClick = (id: string): void => {
  setIsDeleting(true)
  dispatch(deleteItem(id))
}

return (
  <DsButton onClick={() => handleDeleteClick(itemId)}>
    Delete
  </DsButton>
)

// ✅ Better — use useCallback to prevent re-renders
const handleDeleteClick = useCallback((): void => {
  setIsDeleting(true)
  dispatch(deleteItem(itemId))
}, [itemId, dispatch])

return <Button onClick={handleDeleteClick}>Delete</Button>

// ❌ Bad — inline logic in JSX
<DsButton onClick={() => {
  setIsDeleting(true)
  dispatch(deleteItem(itemId))
}}>
  Delete
</DsButton>
```

### 10.2 Variable Destructuring

| Rule                                | Detail                                                                 | Severity |
| ----------------------------------- | ---------------------------------------------------------------------- | -------- |
| **Destructure from objects/arrays** | Destructure variables instead of repeatedly using dot/bracket notation | 🔴 Error |

```typescript
// ✅ Good — destructure once
const LoginForm = ({ user, onSubmit, isLoading }: LoginFormProps) => {
  const { email, firstName, lastName } = user

  return (
    <form>
      <DsTypography>{email}</DsTypography>
      <DsTypography>{firstName} {lastName}</DsTypography>
      <DsButton disabled={isLoading}>Login</DsButton>
    </form>
  )
}

// ❌ Bad — repeated dot notation
const LoginForm = (props: LoginFormProps) => {
  return (
    <form>
      <DsTypography>{props.user.email}</DsTypography>
      <DsTypography>{props.user.firstName} {props.user.lastName}</DsTypography>
      <DsButton disabled={props.isLoading}>Login</DsButton>
    </form>
  )
}
```

### 10.3 String Constants

| Rule                     | Detail                                                                        | Severity |
| ------------------------ | ----------------------------------------------------------------------------- | -------- |
| **No hardcoded strings** | Use constants instead of hardcoding strings (classnames, error messages, IDs) | 🔴 Error |

```typescript
// src/Constants/FORM_KEYS.ts
export const FORM_KEYS = {
  EMAIL: 'email',
  PASSWORD: 'password',
}

export const VALIDATION_MESSAGES = {
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
}

// ✅ Good — use constants
const LoginForm = () => {
  return (
    <Form>
      <DsTextField name={FORM_KEYS.EMAIL} />
      <DsTextField name={FORM_KEYS.PASSWORD} />
    </Form>
  )
}

// ❌ Bad — hardcoded strings
const LoginForm = () => {
  return (
    <Form>
      <DsTextField name="email" />
      <DsTextField name="password" />
    </Form>
  )
}
```

### 10.4 Summary Comments

| Rule                                      | Detail                                                   | Severity     |
| ----------------------------------------- | -------------------------------------------------------- | ------------ |
| **Summary comment for complex functions** | Use summary comment at function start to explain purpose | 🟡 Preferred |

```typescript
// ✅ Good — clear summary
// Validates email format and checks if account exists
const validateEmail = async (email: string): Promise<ValidationResult> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' }
  }

  const exists = await checkEmailExists(email)
  return exists
    ? { valid: false, message: 'Email already registered' }
    : { valid: true }
}

// Transforms raw API response to component-friendly data structure
const transformUserResponse = (apiUser: IApiUser): IUser => {
  return {
    id: apiUser.user_id,
    name: `${apiUser.first_name} ${apiUser.last_name}`.trim(),
    email: apiUser.email_address,
    joinedAt: new Date(apiUser.created_at)
  }
}
```

### 10.5 Avoid Cascading Ternary Operators

| Rule                    | Detail                                                        | Severity |
| ----------------------- | ------------------------------------------------------------- | -------- |
| **No nested ternaries** | Extract complex conditional logic; avoid chained `? :` in JSX | 🔴 Error |

```typescript
// ✅ Good — early returns or helper function
const getStatusBadge = (status: OrderStatus): React.ReactNode => {
  switch (status) {
    case 'pending':
      return <DsBadge variant="warning">Pending</DsBadge>
    case 'shipped':
      return <DsBadge variant="info">Shipped</DsBadge>
    case 'delivered':
      return <DsBadge variant="success">Delivered</DsBadge>
    case 'cancelled':
      return <DsBadge variant="danger">Cancelled</DsBadge>
    default:
      return null
  }
}

// ❌ Bad — cascading ternaries
<>
  {order.status === 'pending' ? (
    <DsBadge variant="warning">Pending</DsBadge>
  ) : order.status === 'shipped' ? (
    <DsBadge variant="info">Shipped</DsBadge>
  ) : order.status === 'delivered' ? (
    <DsBadge variant="success">Delivered</DsBadge>
  ) : order.status === 'cancelled' ? (
    <DsBadge variant="danger">Cancelled</DsBadge>
  ) : null}
</>
```

---

## 11. Assets & Image Optimization

### 11.1 Image Optimization with Rspack

| Rule                           | Detail                                                                            | Severity |
| ------------------------------ | --------------------------------------------------------------------------------- | -------- |
| **Use rspack image optimizer** | Use src constants with rspack query parameters for automatic WebP/AVIF generation | 🔴 Error |
| **Src constants**              | Define all image paths in constants files with rspack format, not inline strings  | 🔴 Error |
| **Use DsImage component**      | Pass image srcSet to `<DsImage>` component from design system                     | 🔴 Error |

### 11.2 Image Constants with Rspack Format

Define images with rspack query parameters to auto-generate multiple formats:

```typescript
// src/Assets/images.ts
// Rspack will automatically generate .avif, .webp, and fallback formats via query parameters

export const INFO_BANNER_ICON = [
  {
    src: new URL(
      '~/src/AssetFiles/images/shakeHands.png?as=avif',
      import.meta.url
    ).href,
    alt: 'shake hands',
    as: 'image/avif',
    type: 'image/avif'
  },
  {
    src: new URL(
      '~/src/AssetFiles/images/shakeHands.png?as=webp',
      import.meta.url
    ).href,
    alt: 'shake hands',
    as: 'image/webp',
    type: 'image/webp'
  },
  {
    src: new URL('~/src/AssetFiles/images/shakeHands.png', import.meta.url)
      .href,
    alt: 'shake hands',
    as: 'image/png',
    type: 'image/png'
  }
]

export const HERO_BANNER = [
  {
    src: new URL('~/src/AssetFiles/images/hero.png?as=avif', import.meta.url)
      .href,
    alt: 'hero banner',
    as: 'image/avif',
    type: 'image/avif'
  },
  {
    src: new URL('~/src/AssetFiles/images/hero.png?as=webp', import.meta.url)
      .href,
    alt: 'hero banner',
    as: 'image/webp',
    type: 'image/webp'
  },
  {
    src: new URL('~/src/AssetFiles/images/hero.png', import.meta.url).href,
    alt: 'hero banner',
    as: 'image/png',
    type: 'image/png'
  }
]

export const PRODUCT_PLACEHOLDER = [
  {
    src: new URL(
      '~/src/AssetFiles/images/placeholder.png?as=avif',
      import.meta.url
    ).href,
    alt: 'product placeholder',
    as: 'image/avif',
    type: 'image/avif'
  },
  {
    src: new URL(
      '~/src/AssetFiles/images/placeholder.png?as=webp',
      import.meta.url
    ).href,
    alt: 'product placeholder',
    as: 'image/webp',
    type: 'image/webp'
  },
  {
    src: new URL('~/src/AssetFiles/images/placeholder.png', import.meta.url)
      .href,
    alt: 'product placeholder',
    as: 'image/png',
    type: 'image/png'
  }
]
```

**Key Structure:**

- Query parameters `?as=avif` and `?as=webp` tell rspack to generate those formats
- Always include PNG fallback without query parameter
- Include `alt`, `as`, and `type` properties for accessibility and proper source detection
- Keep consistent naming convention for constants

### 11.3 Using Images in Components

Use the `<DsImage>` component from design system with srcSet:

```typescript
// ✅ Good — use DsImage with rspack-optimized srcSet
import { DsImage } from '@am92/react-design-system'
import { INFO_BANNER_ICON, HERO_BANNER, PRODUCT_PLACEHOLDER } from '~/Assets/images'

const HeroBanner = () => {
  return (
    <DsImage
      srcSet={HERO_BANNER}
      alt="Hero Banner"
      width={1200}
      height={400}
      loading="lazy"
    />
  )
}

const InfoBanner = () => {
  return (
    <DsImage
      srcSet={INFO_BANNER_ICON}
      alt="Info Banner"
      width={300}
      height={300}
      loading="lazy"
    />
  )
}

const ProductCard = () => {
  return (
    <DsImage
      srcSet={PRODUCT_PLACEHOLDER}
      alt="Product"
      width={250}
      height={250}
      loading="lazy"
    />
  )
}

// ❌ Bad — hardcoded image path without optimization
<img src="/images/hero.png" alt="Hero" />

// ❌ Bad — not using DsImage component
<picture>
  <source srcSet="..." type="image/webp" />
  <img src="..." alt="Image" />
</picture>

// ❌ Bad — missing alt text or dimensions
<DsImage srcSet={HERO_BANNER} />
```

### 11.4 Icon Library

| Rule                          | Detail                                                                       | Severity |
| ----------------------------- | ---------------------------------------------------------------------------- | -------- |
| **Use DsRemixIcon component** | Use `<DsRemixIcon>` component from design system with Remix Icon class names | 🔴 Error |
| **Design system colors**      | Always use design system color variables, never hardcode colors              | 🔴 Error |

```typescript
// ✅ Good — use DsRemixIcon component with class name
import { DsRemixIcon } from '@am92/react-design-system'

const ActionBar = ({ itemId }: ActionBarProps) => {
  const handleDelete = (): void => {
    dispatch(deleteItem(itemId))
  }

  const handleEdit = (): void => {
    dispatch(editItem(itemId))
  }

  return (
    <>
      <DsButton onClick={handleEdit}> EDIT
        <DsRemixIcon className="ri-edit-line" />
      </DsButton>
      <DsButton onClick={handleDelete}> DELETE
        <DsRemixIcon className="ri-delete-bin-2-line" />
      </DsButton>
      <DsButton> ADD
        <DsRemixIcon className="ri-add-line" />
      </DsButton>
    </>
  )
}

// ❌ Bad — importing individual Remix Icon components
import { RiDeleteBin2Line, RiEditLine } from 'react-icons/ri'
<RiDeleteBin2Line size={20} />

// ❌ Bad — hardcoded color instead of design system
<DsRemixIcon className="ri-close-fill" style={{ color: '#FF6C6C' }} />

// ❌ Bad — using HTML entities instead of icon
<button>×</button>
```

---
