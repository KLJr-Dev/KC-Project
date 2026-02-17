# v0.1.x Authentication Flow

This document describes the authentication flows introduced during the v0.1.x identity surface. Each version adds behaviour incrementally. Intentional security weaknesses are documented as they appear.

---

## Registration Flow (v0.1.1)

User creation with minimal validation and weak duplicate handling.

```mermaid
sequenceDiagram
    participant Browser
    participant AuthPage as FE Auth Page
    participant API as lib/api.ts
    participant AuthCtx as AuthContext
    participant Controller as AuthController
    participant AuthSvc as AuthService
    participant UsersSvc as UsersService
    participant Store as In-Memory Store

    Browser->>AuthPage: Fill register form, submit
    AuthPage->>AuthPage: Client-side validation (required fields, email format)
    AuthPage->>API: authRegister({ email, username, password })
    API->>Controller: POST /auth/register
    Controller->>AuthSvc: register(dto)

    alt Missing required fields
        AuthSvc-->>Controller: 400 BadRequest
        Controller-->>API: 400 JSON error
        API-->>AuthPage: throw Error
        AuthPage-->>Browser: ErrorBanner displayed
    end

    AuthSvc->>UsersSvc: findByEmail(email)
    UsersSvc->>Store: Search in-memory array

    alt Duplicate email found
        AuthSvc-->>Controller: 409 Conflict (leaky message includes email)
        Controller-->>API: 409 JSON error
        API-->>AuthPage: throw Error
        AuthPage-->>Browser: ErrorBanner displayed
    end

    AuthSvc->>UsersSvc: create({ email, username, password })
    UsersSvc->>Store: Push new User entity (plaintext password)
    UsersSvc-->>AuthSvc: UserResponseDto (id, email, username)
    AuthSvc-->>Controller: AuthResponseDto { token: stub-token-{id}, userId, message }
    Controller-->>API: 201 JSON response
    API-->>AuthPage: AuthResponse object
    AuthPage->>AuthCtx: login(response) - store token + userId
    AuthCtx->>AuthCtx: Write to localStorage
    AuthPage-->>Browser: SuccessBanner + header flips to Logout
```

### Key details

- Password is stored as **plaintext** in the in-memory `User` entity
- Token is a meaningless string (`stub-token-{id}`) with no cryptographic value
- User IDs are sequential strings (`"1"`, `"2"`, ...) - predictable by design
- The 409 error message includes the email address ("User with email X already exists") - intentionally leaky

---

## Login Flow (v0.1.2)

Login logic with plaintext password comparison.

```mermaid
sequenceDiagram
    participant Browser
    participant AuthPage as FE Auth Page
    participant API as lib/api.ts
    participant AuthCtx as AuthContext
    participant Controller as AuthController
    participant AuthSvc as AuthService
    participant UsersSvc as UsersService
    participant Store as In-Memory Store

    Browser->>AuthPage: Fill login form, submit
    AuthPage->>AuthPage: Client-side validation (required fields, email format)
    AuthPage->>API: authLogin({ email, password })
    API->>Controller: POST /auth/login
    Controller->>AuthSvc: login(dto)

    alt Missing required fields
        AuthSvc-->>Controller: 400 BadRequest
        Controller-->>API: 400 JSON error
        API-->>AuthPage: throw Error
        AuthPage-->>Browser: ErrorBanner displayed
    end

    AuthSvc->>UsersSvc: findEntityByEmail(email)
    UsersSvc->>Store: Search in-memory array

    alt User not found
        AuthSvc-->>Controller: 401 Unauthorized ("No user with that email")
        Controller-->>API: 401 JSON error
        API-->>AuthPage: throw Error
        AuthPage-->>Browser: ErrorBanner displayed
    end

    AuthSvc->>AuthSvc: Compare dto.password === user.password (plaintext)

    alt Password mismatch
        AuthSvc-->>Controller: 401 Unauthorized ("Incorrect password")
        Controller-->>API: 401 JSON error
        API-->>AuthPage: throw Error
        AuthPage-->>Browser: ErrorBanner displayed
    end

    AuthSvc-->>Controller: AuthResponseDto { token: stub-token-{id}, userId, message }
    Controller-->>API: 201 JSON response
    API-->>AuthPage: AuthResponse object
    AuthPage->>AuthCtx: login(response) - store token + userId
    AuthCtx->>AuthCtx: Write to localStorage
    AuthPage-->>Browser: SuccessBanner + header flips to Logout
```

### Key details

- Password comparison is **plaintext equality** (`===`) - no hashing
- Error messages are **distinct**: "No user with that email" vs "Incorrect password" - enables user enumeration
- Uses `findEntityByEmail()` which returns the raw `User` entity (including password), unlike `findByEmail()` which strips it

---

## Session / Token Lifecycle (v0.1.3)

Real JWTs replace stub tokens. Tokens are signed with HS256 using a hardcoded weak secret (`'kc-secret'`), have no expiration claim, and are stored in `localStorage`. The first protected endpoint (`GET /auth/me`) proves the flow works.

### JWT Configuration

- **Algorithm**: HS256 (symmetric — same key signs and verifies)
- **Secret**: `'kc-secret'` (hardcoded in `JwtModule.register()`)
- **Payload**: `{ sub: userId }` — minimal, no role/scope/email
- **Expiration**: none (`exp` claim is absent — tokens live forever)
- **Storage**: `localStorage` under key `kc_auth` (XSS-accessible)

### Token Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Header as Header Component
    participant API as lib/api.ts
    participant AuthCtx as AuthContext
    participant Controller as AuthController
    participant Guard as JwtAuthGuard
    participant AuthSvc as AuthService
    participant JWT as JwtService
    participant UsersSvc as UsersService

    Note over Browser, UsersSvc: Registration / Login (issues JWT)
    Browser->>API: authRegister() or authLogin()
    API->>Controller: POST /auth/register or /auth/login
    Controller->>AuthSvc: register(dto) or login(dto)
    AuthSvc->>JWT: sign({ sub: userId })
    JWT-->>AuthSvc: eyJhbG... (real JWT)
    AuthSvc-->>Controller: AuthResponseDto { token: JWT, userId }
    Controller-->>API: 201 JSON
    API-->>Browser: AuthResponse
    Browser->>AuthCtx: login(response)
    AuthCtx->>AuthCtx: localStorage.setItem('kc_auth', { token, userId })

    Note over Browser, UsersSvc: Protected request (GET /auth/me)
    Browser->>Header: mount (isAuthenticated = true)
    Header->>API: authMe()
    API->>API: getHeaders() reads JWT from localStorage
    API->>Controller: GET /auth/me + Authorization: Bearer JWT
    Controller->>Guard: canActivate()
    Guard->>JWT: verify(token)
    JWT-->>Guard: { sub: userId, iat }
    Guard-->>Controller: request.user = payload
    Controller->>AuthSvc: getProfile(user.sub)
    AuthSvc->>UsersSvc: findById(userId)
    UsersSvc-->>AuthSvc: UserResponseDto
    AuthSvc-->>Controller: { id, email, username }
    Controller-->>API: 200 JSON
    API-->>Header: UserResponse
    Header-->>Browser: Display username next to Logout
```

### Key details

- Stub tokens (`stub-token-{id}`) are fully replaced — register and login now return real JWTs
- `getHeaders()` in `api.ts` reads the token from `localStorage` and attaches it as `Authorization: Bearer` on every request
- `JwtAuthGuard` verifies the signature but does NOT check that the user still exists (CWE-613)
- `@CurrentUser()` decorator extracts the decoded payload from `request.user`
- `AuthService.getProfile()` looks up the user by ID — throws 404 if the user no longer exists

---

## Logout Flow (v0.1.4 - future)

Not yet implemented on the backend. Current client-side behaviour:

- `AuthContext.logout()` clears `token` and `userId` from React state and `localStorage`
- Header toggles from "Logout" back to "Sign In"
- **No server-side invalidation** - the token (once real) remains valid after client-side logout
- Tokens will be reusable after logout (intentional per roadmap)

---

## Module Dependencies

`AuthModule` imports `UsersModule` (user data access) and `JwtModule` (token signing/verification).

```mermaid
graph LR
    AuthModule --> UsersModule
    AuthModule --> JwtModule

    AuthSvc["AuthService"] --> UsersSvc["UsersService"]
    AuthSvc --> JwtSvc["JwtService"]
    Guard["JwtAuthGuard"] --> JwtSvc

    AuthSvc -->|"register()"| CreateUser["UsersService.create()"]
    AuthSvc -->|"register()"| FindByEmail["UsersService.findByEmail()"]
    AuthSvc -->|"login()"| FindEntity["UsersService.findEntityByEmail()"]
    AuthSvc -->|"getProfile()"| FindById["UsersService.findById()"]
    AuthSvc -->|"register() / login()"| Sign["JwtService.sign()"]
    Guard -->|"canActivate()"| Verify["JwtService.verify()"]
```

---

## Frontend Auth Architecture

```mermaid
graph TD
    Layout["layout.tsx"]
    Providers["providers.tsx"]
    AuthProvider["AuthProvider (lib/auth-context.tsx)"]
    ThemeProvider["ThemeProvider (lib/theme-context.tsx)"]
    Header["Header (components/header.tsx)"]
    AuthPage["Auth Page (app/auth/page.tsx)"]
    APILayer["lib/api.ts"]
    GetHeaders["getHeaders()"]

    Layout --> Providers
    Providers --> ThemeProvider
    Providers --> AuthProvider
    AuthProvider --> Header
    AuthProvider --> AuthPage

    AuthPage -->|"authRegister() / authLogin()"| APILayer
    AuthPage -->|"login(response)"| AuthProvider
    Header -->|"isAuthenticated / logout()"| AuthProvider
    Header -->|"authMe() on mount"| APILayer

    APILayer --> GetHeaders
    GetHeaders -->|"reads JWT from localStorage"| AuthProvider
    APILayer -->|"POST /auth/register"| Backend["Backend :4000"]
    APILayer -->|"POST /auth/login"| Backend
    APILayer -->|"GET /auth/me + Bearer JWT"| Backend
```

### Auth Context State

```
{
  token: string | null       // real JWT (HS256, 'kc-secret') or null
  userId: string | null      // user ID from AuthResponseDto or null
  isAuthenticated: boolean   // derived: !!token (presence check only, no validation)
  login(response): void      // stores token + userId in state + localStorage
  logout(): void             // clears state + localStorage (client-side only)
}
```

Persisted to `localStorage` under key `kc_auth`. Hydrated on mount via `useEffect`.

Note: `isAuthenticated` only checks that a token string exists — it does NOT validate the JWT signature, check expiration, or confirm the user still exists. A fabricated or expired token in `localStorage` will show the authenticated UI until the next API call fails with 401.

---

## Security Surface Summary

Intentional weaknesses introduced at each v0.1.x version:

| Version | Weakness | Type | Detail |
|---------|----------|------|--------|
| v0.1.1 | Plaintext password storage | CWE-256 | Passwords stored as-is in User entity |
| v0.1.1 | Leaky duplicate error | CWE-209 | 409 message includes the email address |
| v0.1.1 | Sequential user IDs | CWE-330 | IDs are predictable ("1", "2", "3"...) |
| v0.1.2 | Plaintext password comparison | CWE-256 | `===` comparison, no hashing |
| v0.1.2 | Distinct auth errors | CWE-204 | "No user with that email" vs "Incorrect password" |
| v0.1.3 | Weak JWT secret | CWE-347 / CWE-798 | Hardcoded `'kc-secret'`, HS256 symmetric — trivially forged |
| v0.1.3 | No token expiration | CWE-613 | JWTs have no `exp` claim — valid forever |
| v0.1.3 | localStorage token storage | CWE-922 | Accessible to XSS, no httpOnly cookie |
| v0.1.3 | No user-existence check in guard | CWE-613 | Deleted user's JWT still passes verification |
| v0.1.3 | Missing authorization on /auth/me | CWE-862 | Any valid token gets full profile — no scope/role check |
| v0.1.3 | Permissive CORS | CWE-942 | `enableCors()` with no options — all origins allowed |
| v0.1.3 | Cleartext transport | CWE-319 | HTTP only — tokens and passwords sent unencrypted |
| v0.1.3 | Source code comments in CSR bundle | CWE-615 | Frontend comments (VULN annotations, API structure) visible in DevTools |
| v0.1.4 | No session invalidation | CWE-613 | Server doesn't track or revoke tokens (planned) |
| v0.1.5 | No rate limiting | CWE-307 | Unlimited login attempts (planned) |
