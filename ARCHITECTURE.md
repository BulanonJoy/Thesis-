# 🏗️ System Architecture

Complete architecture documentation for the Thesis Repository System.

---

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Web Browser                            │  │
│  │  • Chrome, Firefox, Safari, Edge                         │  │
│  │  • Responsive: Desktop, Tablet, Mobile                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/HTTPS
                           │ JSON over REST
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                             │
│                  (React 18 + TypeScript)                         │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Pages     │  │ Components  │  │  Contexts   │            │
│  │             │  │             │  │             │            │
│  │ • Login     │  │ • Button    │  │ • AuthContext│           │
│  │ • Browse    │  │ • Card      │  │             │            │
│  │ • Upload    │  │ • Input     │  │             │            │
│  │ • Admin     │  │ • Dialog    │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                │                  │                    │
│         └────────────────┴──────────────────┘                    │
│                          │                                        │
│                          ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            API Service Layer (api-service.ts)            │  │
│  │  • HTTP Client                                            │  │
│  │  • Request/Response Handling                              │  │
│  │  • JWT Token Management                                   │  │
│  │  • Error Handling                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API Calls
                           │ Authorization: Bearer <token>
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│              (ASP.NET Core 8.0 Web API)                          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Controllers                        │  │
│  │                                                           │  │
│  │  AuthController      UsersController                      │  │
│  │  ThesesController    PasswordResetController              │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               │                                                  │
│               ▼                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Middleware Pipeline                         │  │
│  │  • JWT Authentication                                     │  │
│  │  • CORS                                                   │  │
│  │  • Exception Handling                                     │  │
│  │  • Request Logging                                        │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               │                                                  │
│               ▼                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 Business Logic Layer                      │  │
│  │                      (Services)                           │  │
│  │                                                           │  │
│  │  AuthService         UserService                          │  │
│  │  ThesisService       PasswordResetService                 │  │
│  └────────────┬─────────────────────────────────────────────┘  │
└───────────────┼──────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA ACCESS LAYER                            │
│              (Entity Framework Core 8.0)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            ApplicationDbContext                           │  │
│  │  • DbSet<User>                                            │  │
│  │  • DbSet<Thesis>                                          │  │
│  │  • DbSet<PasswordResetRequest>                            │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               │                                                  │
│               │ LINQ Queries                                     │
│               │ Change Tracking                                  │
│               │ Migrations                                       │
│               ▼                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Entity Models                            │  │
│  │  • User                                                   │  │
│  │  • Thesis                                                 │  │
│  │  • PasswordResetRequest                                   │  │
│  └────────────┬─────────────────────────────────────────────┘  │
└───────────────┼──────────────────────────────────────────────────┘
                │ SQL Commands
                │ (SELECT, INSERT, UPDATE, DELETE)
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│                   (Microsoft SQL Server)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      Tables                               │  │
│  │                                                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐      │  │
│  │  │  Users   │  │  Theses  │  │ PasswordResetReqs │      │  │
│  │  └──────────┘  └──────────┘  └───────────────────┘      │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────┐       │  │
│  │  │              Indexes                          │       │  │
│  │  │  • Users.Email (Unique)                       │       │  │
│  │  │  • Theses.Title                               │       │  │
│  │  │  • Theses.Year                                │       │  │
│  │  │  • Theses.Status                              │       │  │
│  │  └──────────────────────────────────────────────┘       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow

### Authentication Flow

```
User Login Request
      │
      ▼
┌─────────────────┐
│  Login Page     │
│  (React)        │
└────────┬────────┘
         │ POST /api/Auth/signin
         │ { email, password }
         ▼
┌─────────────────┐
│ AuthController  │
│ (C#)            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AuthService    │
│  • Validate     │
│  • Hash check   │
│  • Generate JWT │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │
│   (Verify user) │
└────────┬────────┘
         │
         ▼
Return JWT Token & User Data
      │
      ▼
Store in localStorage
      │
      ▼
Include in all future requests
Authorization: Bearer <token>
```

### Thesis Upload Flow

```
Upload Thesis Form
      │
      ▼
┌─────────────────┐
│  Upload Page    │
│  (React)        │
│  • Fill form    │
│  • Select PDF   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  File Reader    │
│  Convert to     │
│  Base64         │
└────────┬────────┘
         │ POST /api/Theses
         │ { title, abstract, pdfData, ... }
         │ Authorization: Bearer <token>
         ▼
┌─────────────────┐
│ThesesController │
│ (C#)            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  JWT Middleware │
│  • Validate     │
│  • Extract user │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ThesisService   │
│  • Validate     │
│  • Create       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  EF Core        │
│  • Insert       │
│  • SaveChanges  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   SQL Server    │
│   (Store data)  │
└────────┬────────┘
         │
         ▼
Return Thesis Object
      │
      ▼
Update UI
Show Success Message
```

### Approval Flow

```
Thesis Pending Approval
      │
      ▼
┌─────────────────┐
│ Approver Views  │
│ Review Queue    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Clicks Approve  │
│ Button          │
└────────┬────────┘
         │ PATCH /api/Theses/{id}
         │ { status: "approved", approvedBy: "..." }
         │ Authorization: Bearer <token>
         ▼
┌─────────────────┐
│ThesesController │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ JWT Middleware  │
│ Verify approver │
│ role            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ThesisService   │
│ Update status   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  EF Core        │
│  UPDATE Theses  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   SQL Server    │
└────────┬────────┘
         │
         ▼
Return Updated Thesis
      │
      ▼
Refresh Queue View
Show Success Message
```

---

## 🗂️ Component Architecture

### Frontend Component Hierarchy

```
App.tsx
  │
  ├─ RouterProvider
  │   │
  │   ├─ LandingPage (/)
  │   │
  │   ├─ LoginPage (/login)
  │   │
  │   ├─ SignUpPage (/signup)
  │   │
  │   ├─ ForgotPasswordPage (/forgot-password)
  │   │
  │   ├─ GuestBrowsePage (/browse)
  │   │
  │   └─ DashboardLayout (/dashboard)
  │       │
  │       ├─ Sidebar Navigation
  │       │   │
  │       │   ├─ Role-based menu items
  │       │   ├─ User info card
  │       │   └─ Logout button
  │       │
  │       └─ Outlet (Page Content)
  │           │
  │           ├─ Dashboard (/dashboard)
  │           ├─ BrowsePage (/dashboard/browse)
  │           ├─ ThesisViewerPage (/dashboard/thesis/:id)
  │           ├─ UploadPage (/dashboard/upload)
  │           ├─ ApprovalPage (/dashboard/approvals)
  │           ├─ AdminPage (/dashboard/admin)
  │           └─ PasswordResetManagementPage
  │
  └─ AuthProvider (Context)
      │
      └─ Provides:
          • user
          • signIn()
          • signOut()
          • signUp()
```

### Backend Service Architecture

```
Controllers
    │
    ├─ AuthController
    │   ├─ SignIn()
    │   ├─ SignUp()
    │   └─ SignOut()
    │
    ├─ UsersController
    │   ├─ GetAllUsers()
    │   ├─ GetUserById()
    │   └─ UpdateUserStatus()
    │
    ├─ ThesesController
    │   ├─ GetAllTheses()
    │   ├─ GetThesisById()
    │   ├─ CreateThesis()
    │   ├─ UpdateThesis()
    │   ├─ DeleteThesis()
    │   ├─ UploadPdf()
    │   └─ GetPdfData()
    │
    └─ PasswordResetController
        ├─ CreateRequest()
        ├─ GetAllRequests()
        ├─ UpdateRequest()
        └─ DeleteRequest()
        │
        ▼
Services (Business Logic)
    │
    ├─ IAuthService / AuthService
    │   ├─ SignIn()
    │   ├─ SignUp()
    │   └─ GenerateJwtToken()
    │
    ├─ IUserService / UserService
    │   ├─ GetAllUsers()
    │   ├─ GetUserById()
    │   └─ UpdateUserStatus()
    │
    ├─ IThesisService / ThesisService
    │   ├─ GetAllTheses()
    │   ├─ GetThesisById()
    │   ├─ CreateThesis()
    │   ├─ UpdateThesis()
    │   ├─ DeleteThesis()
    │   ├─ UploadPdf()
    │   └─ GetPdfData()
    │
    └─ IPasswordResetService / PasswordResetService
        ├─ CreateRequest()
        ├─ GetAllRequests()
        ├─ UpdateRequest()
        └─ DeleteRequest()
        │
        ▼
Data Access (EF Core)
    │
    └─ ApplicationDbContext
        ├─ DbSet<User>
        ├─ DbSet<Thesis>
        └─ DbSet<PasswordResetRequest>
        │
        ▼
Database (SQL Server)
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
└─────────────────────────────────────────────────────────────┘

Layer 1: Transport Security
├─ HTTPS (Production)
└─ CORS Configuration (Development: localhost only)

Layer 2: Authentication
├─ JWT Tokens (HS256)
├─ Token Expiry (7 days)
└─ Token Validation Middleware

Layer 3: Password Security
├─ BCrypt Hashing (Cost Factor: 10)
├─ Salt per password
└─ No plain text storage

Layer 4: Authorization
├─ Role-Based Access Control
├─ Route Protection
└─ Endpoint Permissions

Layer 5: Input Validation
├─ Frontend Validation (React)
├─ Backend Validation (Data Annotations)
└─ SQL Injection Prevention (EF Core)

Layer 6: Data Protection
├─ XSS Protection (React escaping)
├─ CSRF Protection
└─ Sanitized Outputs
```

---

## 📦 Deployment Architecture

### Development Environment

```
Developer Machine
├─ Frontend (Vite Dev Server)
│   └─ http://localhost:5173
├─ Backend (dotnet run)
│   └─ http://localhost:5000
└─ Database (LocalDB)
    └─ (localdb)\mssqllocaldb
```

### Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer / CDN                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│  Static Files   │         │   API Server    │
│  (Frontend)     │         │   (Backend)     │
│                 │         │                 │
│  • Nginx/IIS    │         │  • IIS/Linux    │
│  • React Build  │         │  • ASP.NET Core │
│  • Static HTML  │         │  • JWT Auth     │
└─────────────────┘         └────────┬────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   SQL Server    │
                            │   (Production)  │
                            │                 │
                            │  • Encrypted    │
                            │  • Backups      │
                            │  • Monitoring   │
                            └─────────────────┘
```

---

## 🔄 Data Flow Patterns

### Read Pattern (GET Request)

```
Frontend → API Service → Controller → Service → DbContext → Database
                                                                 │
                                                                 ▼
Frontend ← API Service ← Controller ← Service ← DbContext ← Results
```

### Write Pattern (POST/PATCH Request)

```
Frontend → Validation → API Service → Controller → JWT Validation
                                                         │
                                                         ▼
                                                    Service → Validation
                                                         │
                                                         ▼
                                                    DbContext → Database
                                                         │
                                                         ▼
Frontend ← API Service ← Controller ← Service ← Confirmation
```

---

## 🎯 Design Patterns Used

### Frontend Patterns
- **Component Pattern** - Reusable UI components
- **Container/Presentational** - Smart vs. Dumb components
- **Context API** - Global state management
- **Custom Hooks** - Reusable logic
- **Higher-Order Components** - Protected routes

### Backend Patterns
- **Repository Pattern** - Data access abstraction (via EF Core)
- **Service Layer Pattern** - Business logic separation
- **Dependency Injection** - Loose coupling
- **DTO Pattern** - Data transfer objects
- **Interface Segregation** - Service interfaces

---

## 📊 Performance Considerations

### Frontend Optimization
- Code splitting via React Router
- Lazy loading of components
- Memoization where needed
- Optimized re-renders
- Efficient state management

### Backend Optimization
- Async/await throughout
- Database indexing
- Query optimization
- Connection pooling
- Response caching (where appropriate)

### Database Optimization
- Indexed columns (Email, Title, Year, Status)
- Normalized schema
- Efficient foreign keys
- Regular maintenance

---

## 🔧 Configuration Management

```
Frontend Configuration
├─ .env (Development)
│   └─ VITE_API_URL
└─ .env.production (Production)
    └─ VITE_API_URL

Backend Configuration
├─ appsettings.json (Default)
│   ├─ ConnectionStrings
│   ├─ JwtSettings
│   └─ Logging
└─ appsettings.Production.json (Production)
    ├─ ConnectionStrings (Production DB)
    ├─ JwtSettings (Secure secret)
    └─ Logging (Production level)
```

---

This architecture provides a solid foundation for a scalable, maintainable, and secure thesis repository system.

