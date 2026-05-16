# Thesis Archiving and Research Publication Repository System (TARPS)

A comprehensive web-based platform for centrally storing, managing, and providing controlled access to engineering theses and research publications.

## 🌟 Features

### Role-Based Access Control
- **System Administrator** - Complete system management and user approval
- **Thesis Uploader/Department Secretary** - Upload and manage theses
- **Thesis Approver/Faculty** - Review and approve/reject submissions
- **Faculty Members** - Browse and access all approved theses
- **Students** - Browse and access all approved theses
- **Guest Users** - Limited access (title, abstract, keywords only)

### Core Functionality
- ✅ User registration with admin approval
- ✅ Secure authentication with JWT tokens
- ✅ Thesis upload with PDF support
- ✅ Multi-stage approval workflow
- ✅ Advanced search and filtering
- ✅ Password reset with admin approval
- ✅ Professional academic-themed UI (Gold & Green)
- ✅ Responsive design for all devices
- ✅ Guest browsing without login

## 🏗️ Architecture

### Frontend
- **Framework:** React 18 with TypeScript
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4
- **UI Components:** Custom component library
- **State Management:** React Context API
- **Build Tool:** Vite

### Backend
- **Framework:** ASP.NET Core 8.0 Web API
- **Database:** SQL Server (LocalDB/Express/Full)
- **ORM:** Entity Framework Core 8.0
- **Authentication:** JWT Bearer Tokens
- **Password Hashing:** BCrypt.Net
- **API Documentation:** Swagger/OpenAPI

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **.NET 8.0 SDK** ([Download](https://dotnet.microsoft.com/download))
- **SQL Server** (LocalDB/Express/Full) ([Download](https://www.microsoft.com/sql-server/sql-server-downloads))
- **pnpm** package manager: `npm install -g pnpm`

## 🚀 Quick Start

### Option 1: Automated Startup (Windows)

```bash
start-app.bat
```

### Option 2: Automated Startup (Linux/Mac)

```bash
chmod +x start-app.sh
./start-app.sh
```

### Option 3: Manual Startup

**Terminal 1 - Backend:**
```bash
cd backend
dotnet restore
dotnet run
```

**Terminal 2 - Frontend:**
```bash
pnpm install
pnpm dev
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Documentation:** http://localhost:5000/swagger

## 🔑 Default Login Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@thesis.com | AdminPass123! | Administrator |
| faculty@thesis.com | password123 | Faculty Member |
| student@thesis.com | password123 | Student |
| uploader@thesis.com | password123 | Thesis Uploader |
| approver@thesis.com | password123 | Thesis Approver |

## 📁 Project Structure

```
thesis-repository-system/
├── backend/                          # C# ASP.NET Core Backend
│   ├── Controllers/                  # API Controllers
│   │   ├── AuthController.cs         # Authentication endpoints
│   │   ├── UsersController.cs        # User management
│   │   ├── ThesesController.cs       # Thesis management
│   │   └── PasswordResetController.cs# Password reset
│   ├── Data/                         # Database layer
│   │   ├── ApplicationDbContext.cs   # EF Core context
│   │   └── DbInitializer.cs          # Seed data
│   ├── DTOs/                         # Data transfer objects
│   │   ├── AuthDTOs.cs
│   │   └── ThesisDTOs.cs
│   ├── Models/                       # Entity models
│   │   ├── User.cs
│   │   ├── Thesis.cs
│   │   └── PasswordResetRequest.cs
│   ├── Services/                     # Business logic
│   │   ├── AuthService.cs
│   │   ├── UserService.cs
│   │   ├── ThesisService.cs
│   │   └── PasswordResetService.cs
│   ├── Program.cs                    # App entry point
│   ├── appsettings.json              # Configuration
│   └── ThesisRepository.csproj       # Project file
│
├── src/                              # React Frontend
│   ├── app/
│   │   ├── components/               # Reusable components
│   │   │   ├── ui/                   # UI primitives
│   │   │   └── figma/                # Figma imports
│   │   ├── contexts/                 # React contexts
│   │   │   └── auth-context.tsx      # Authentication
│   │   ├── layouts/                  # Layout components
│   │   │   └── dashboard-layout.tsx
│   │   ├── pages/                    # Page components
│   │   │   ├── landing-page.tsx
│   │   │   ├── login-page.tsx
│   │   │   ├── signup-page.tsx
│   │   │   ├── admin-page.tsx
│   │   │   ├── browse-page.tsx
│   │   │   ├── upload-page.tsx
│   │   │   ├── approval-page.tsx
│   │   │   ├── forgot-password-page.tsx
│   │   │   └── password-reset-management-page.tsx
│   │   ├── routes.tsx                # Route configuration
│   │   └── App.tsx                   # Root component
│   ├── lib/
│   │   ├── api-service.ts            # API client (HTTP requests)
│   │   └── mock-data.ts              # Data layer adapter
│   └── styles/                       # Global styles
│
├── .env                              # Environment variables
├── .env.example                      # Environment template
├── package.json                      # Frontend dependencies
├── tsconfig.json                     # TypeScript config
├── vite.config.ts                    # Vite configuration
├── tailwind.config.js                # Tailwind config
├── start-app.bat                     # Windows startup script
├── start-app.sh                      # Linux/Mac startup script
├── SETUP_GUIDE.md                    # Detailed setup guide
└── PROJECT_README.md                 # This file
```

## 🔧 Configuration

### Backend Configuration

Edit `backend/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ThesisRepositoryDb;Trusted_Connection=true"
  },
  "JwtSettings": {
    "Secret": "YourSuperSecretKeyForThesisRepositorySystem2024!@#$%",
    "ExpiryInDays": 7
  }
}
```

### Frontend Configuration

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🎨 UI Theme

The application uses a professional academic color scheme:

- **Primary Green:** #2D5016 (Dark Forest Green)
- **Secondary Green:** #4A7C2D (Medium Green)
- **Accent Gold:** #D4AF37 (Academic Gold)
- **Light Gold:** #F4E5C2 (Cream)
- **Light Green:** #E8F5E1 (Mint)

## 📊 Database Schema

### Users Table
- id (Primary Key)
- email (Unique)
- name
- passwordHash
- role
- isApproved
- isActive
- createdAt
- updatedAt

### Theses Table
- id (Primary Key)
- title
- abstract
- keywords (JSON)
- authors
- department
- year
- pdfUrl
- pdfData (Base64)
- status
- uploadedBy (Foreign Key)
- approvedBy (Foreign Key)
- createdAt
- updatedAt

### PasswordResetRequests Table
- id (Primary Key)
- email
- status
- requestedAt
- processedAt
- processedBy (Foreign Key)

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **BCrypt Password Hashing** - Industry-standard password security
- **Role-Based Authorization** - Granular access control
- **CORS Protection** - Configured allowed origins
- **SQL Injection Prevention** - Entity Framework parameterization
- **XSS Protection** - React's built-in escaping

## 🧪 Testing

### Backend API Testing

Use Swagger UI:
```
http://localhost:5000/swagger
```

### Manual Testing Workflow

1. **User Registration:**
   - Register a new account
   - Login as admin
   - Approve the new user
   - Login with new account

2. **Thesis Workflow:**
   - Login as uploader
   - Upload a thesis with PDF
   - Login as approver
   - Approve/reject the thesis
   - Login as student/faculty
   - Browse and view approved theses

3. **Password Reset:**
   - Request password reset
   - Login as admin
   - Approve reset request
   - Admin provides new password

## 📦 Building for Production

### Backend

```bash
cd backend
dotnet publish -c Release -o ./publish
```

### Frontend

```bash
pnpm build
```

Output will be in `dist/` folder.

## 🐛 Troubleshooting

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed troubleshooting steps.

Common issues:
- **Port conflicts:** Change ports in configuration
- **Database errors:** Verify SQL Server is running
- **CORS errors:** Check allowed origins in backend
- **API connection:** Verify backend URL in `.env`

## 📝 API Endpoints

### Authentication
- `POST /api/Auth/signin` - User login
- `POST /api/Auth/signup` - User registration
- `POST /api/Auth/signout` - User logout

### Users
- `GET /api/Users` - List all users
- `GET /api/Users/{id}` - Get user details
- `PATCH /api/Users/{id}/status` - Update user status

### Theses
- `GET /api/Theses` - List all theses
- `GET /api/Theses/{id}` - Get thesis details
- `POST /api/Theses` - Create thesis
- `PATCH /api/Theses/{id}` - Update thesis
- `DELETE /api/Theses/{id}` - Delete thesis
- `POST /api/Theses/upload-pdf` - Upload PDF
- `GET /api/Theses/pdf/{fileId}` - Download PDF

### Password Reset
- `POST /api/PasswordReset` - Request password reset
- `GET /api/PasswordReset` - List all requests
- `PATCH /api/PasswordReset/{id}` - Process request
- `DELETE /api/PasswordReset/{id}` - Delete request

## 🤝 Contributing

This is a complete, production-ready application. For modifications:

1. Backend changes: Edit C# files in `backend/`
2. Frontend changes: Edit React files in `src/`
3. Database changes: Update models and regenerate migrations
4. API changes: Update controllers and DTOs

## 📄 License

Copyright © 2024 Thesis Repository System. All rights reserved.

## 👨‍💻 Development Team

Developed as a comprehensive thesis archiving solution for academic institutions.

## 🆘 Support

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

For backend-specific information, see [backend/README.md](./backend/README.md)

---

**Built with ❤️ using React, TypeScript, C#, and ASP.NET Core**
