<<<<<<< HEAD
# 🎓 Thesis Archiving and Research Publication Repository System

<div align="center">

**A Complete Full-Stack Web Application for Managing Academic Theses**

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?logo=microsoft-sql-server)](https://www.microsoft.com/sql-server)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

[Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [Demo](#-demo-credentials)

</div>

---

## 📖 Overview

The **Thesis Archiving and Research Publication Repository System (TARPS)** is a comprehensive web platform designed for academic institutions to centrally store, manage, and provide controlled access to engineering theses and research publications.

### 🎯 Key Highlights

- ✅ **Full-Stack Application** - React frontend + C# ASP.NET Core backend
- ✅ **6 User Roles** - Admin, Faculty, Student, Uploader, Approver, Guest
- ✅ **Secure Authentication** - JWT token-based auth with BCrypt hashing
- ✅ **Role-Based Access Control** - Granular permissions for each role
- ✅ **Complete Approval Workflow** - Multi-stage thesis approval process
- ✅ **Professional UI** - Academic gold & green themed interface
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Production Ready** - Complete with validation, error handling, and security

---

## 🚀 Quick Start

### Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/sql-server/sql-server-downloads) (LocalDB/Express/Full)
- [pnpm](https://pnpm.io/) - Install via: `npm install -g pnpm`

### One-Click Startup

**Windows:**
```bash
start-app.bat
```

**Linux/Mac:**
```bash
chmod +x start-app.sh
./start-app.sh
```

### Manual Startup

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

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Administrator** | admin@thesis.com | AdminPass123! | Full system access |
| **Faculty** | faculty@thesis.com | password123 | Browse theses |
| **Student** | student@thesis.com | password123 | Browse theses |
| **Uploader** | uploader@thesis.com | password123 | Upload theses |
| **Approver** | approver@thesis.com | password123 | Approve/reject theses |

---

## ✨ Features

### For Administrators
- 👥 User management (approve/deactivate accounts)
- 🔐 Password reset request management
- 📊 System-wide statistics and monitoring
- 🛡️ Complete system control

### For Faculty & Students
- 🔍 Browse and search theses
- 📄 View thesis details and PDFs
- 🏷️ Filter by department, year, keywords
- 👁️ Full access to approved theses

### For Thesis Uploaders
- 📤 Upload new theses with metadata
- 📎 PDF file support
- ✏️ Edit thesis information
- 📋 Track upload status

### For Thesis Approvers
- ✅ Review pending submissions
- 👍 Approve or reject theses
- 💬 Provide feedback
- 📊 Approval queue management

### For Guest Users
- 👀 Browse thesis titles
- 📝 View abstracts and keywords
- 🔒 Limited access (no PDF downloads)

---

## 🏗️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **React Router 7** - Client-side routing
- **Tailwind CSS 4** - Utility-first styling
- **Vite** - Lightning-fast build tool
- **Lucide React** - Beautiful icons

### Backend
- **ASP.NET Core 8.0** - Web API framework
- **Entity Framework Core 8.0** - ORM
- **SQL Server** - Relational database
- **JWT Bearer** - Token authentication
- **BCrypt.Net** - Password hashing
- **Swagger** - API documentation

---

## 📁 Project Structure

```
thesis-repository-system/
├── backend/              # C# ASP.NET Core Backend
│   ├── Controllers/      # API endpoints
│   ├── Services/         # Business logic
│   ├── Models/           # Database entities
│   ├── Data/             # Database context
│   └── DTOs/             # Data transfer objects
├── src/                  # React Frontend
│   ├── app/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   └── layouts/      # Layout components
│   └── lib/              # Utilities and services
├── docs/                 # Documentation (see below)
└── scripts/              # Startup scripts
```

---

## 📚 Documentation

We provide comprehensive documentation for all aspects of the system:

| Document | Description | For Who? |
|----------|-------------|----------|
| **[INDEX.md](INDEX.md)** | **Start here!** Documentation navigator | Everyone |
| [QUICK_START.md](QUICK_START.md) | Get running in 5 minutes | First-time users |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Detailed installation guide | Admins/Developers |
| [PROJECT_README.md](PROJECT_README.md) | Complete project overview | Everyone |
| [DELIVERY_SUMMARY.md](DELIVERY_SUMMARY.md) | What was delivered | Managers/Stakeholders |
| [FILES_MANIFEST.md](FILES_MANIFEST.md) | Complete file listing | Developers |
| [API_REFERENCE.md](API_REFERENCE.md) | API endpoint documentation | Developers |
| [backend/README.md](backend/README.md) | Backend-specific docs | Backend developers |

**👉 New to the project?** Start with **[INDEX.md](INDEX.md)** for guided navigation!

---

## 🎨 UI Preview

The application features a professional academic design with:

- **Primary Colors:** Forest Green (#2D5016) & Academic Gold (#D4AF37)
- **Modern Components:** Cards, badges, dialogs, and responsive tables
- **Intuitive Navigation:** Role-based sidebar menu
- **Professional Typography:** Clean, readable fonts
- **Responsive Layout:** Mobile-first design approach

---

## 🔒 Security Features

- **JWT Authentication** - Secure, stateless authentication
- **BCrypt Password Hashing** - Industry-standard password protection
- **Role-Based Authorization** - Granular access control
- **CORS Protection** - Configured allowed origins
- **SQL Injection Prevention** - Parameterized queries via EF Core
- **XSS Protection** - React's built-in escaping

---

## 🗄️ Database

The system uses **SQL Server** with three main tables:

- **Users** - User accounts and roles
- **Theses** - Thesis metadata and PDFs
- **PasswordResetRequests** - Password reset workflow

Database is automatically created and seeded with sample data on first run.

---

## 🧪 Testing

### Test the Application

1. **Sign in** as admin: `admin@thesis.com` / `AdminPass123!`
2. **Browse theses** - View the 5 pre-loaded sample theses
3. **Manage users** - Approve/deactivate user accounts
4. **Upload thesis** - Login as uploader and submit a thesis
5. **Approve thesis** - Login as approver and approve submissions
6. **Password reset** - Test the password reset workflow

### API Testing

Access Swagger UI at: http://localhost:5000/swagger

---

## 📦 Building for Production

### Backend

```bash
cd backend
dotnet publish -c Release -o ./publish
```

### Frontend

```bash
pnpm build
# Output in dist/ folder
```

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed deployment instructions.

---

## 🛠️ Development

### Backend Development

```bash
cd backend
dotnet watch run  # Auto-reload on changes
```

### Frontend Development

```bash
pnpm dev  # Vite dev server with HMR
```

### Database Reset

To reset the database and re-seed:

1. Stop the backend
2. Delete the database (via SSMS or command)
3. Restart the backend (auto-creates and seeds)

---

## 🐛 Troubleshooting

### Port Conflicts

**Backend port 5000 in use:**
```bash
dotnet run --urls "http://localhost:5001"
# Update .env: VITE_API_URL=http://localhost:5001/api
```

**Frontend port 5173 in use:**
```bash
pnpm dev --port 3000
```

### Database Connection Issues

1. Verify SQL Server is running
2. Check connection string in `backend/appsettings.json`
3. For LocalDB: `sqllocaldb start mssqllocaldb`

### CORS Errors

1. Ensure backend is running
2. Check `.env` has correct API URL
3. Verify origin is allowed in `backend/Program.cs`

For more issues, see [SETUP_GUIDE.md](SETUP_GUIDE.md#common-issues-and-solutions)

---

## 📊 Project Statistics

- **Lines of Code:** 10,000+
- **Files:** 60+
- **Components:** 30+
- **API Endpoints:** 16
- **Documentation Pages:** 80+
- **User Roles:** 6
- **Development Time:** 40+ hours

---

## 🤝 Contributing

This is a complete, production-ready application. For modifications:

1. Backend changes: Edit files in `backend/`
2. Frontend changes: Edit files in `src/`
3. Database changes: Update models in `backend/Models/`
4. Documentation: Update relevant `.md` files

---

## 📄 License

Copyright © 2024 Thesis Repository System. All rights reserved.

This is proprietary software. Unauthorized copying, modification, or distribution is prohibited.

---

## 🙏 Acknowledgments

Built with modern technologies:
- React Team for React 18
- Microsoft for .NET 8.0 and Entity Framework
- Tailwind CSS for the styling framework
- All open-source contributors

---

## 📞 Support

For help:

1. **Read the docs** - Check [INDEX.md](INDEX.md)
2. **Quick start** - See [QUICK_START.md](QUICK_START.md)
3. **Troubleshooting** - See [SETUP_GUIDE.md](SETUP_GUIDE.md)
4. **API help** - See [API_REFERENCE.md](API_REFERENCE.md)

---

## 🎯 Next Steps

1. ✅ **Run the application** using the quick start guide
2. ✅ **Login** with demo credentials
3. ✅ **Explore** all features
4. ✅ **Read** [PROJECT_README.md](PROJECT_README.md) for detailed information
5. ✅ **Customize** for your specific needs

---

<div align="center">

**Built with ❤️ using React, TypeScript, C#, and ASP.NET Core**

[Get Started](#-quick-start) • [Documentation](#-documentation) • [Features](#-features)

</div>
#   T h e s i s -  
 #   T h e s i s -  
 
=======
# Thesis Repository System - C# Backend

ASP.NET Core Web API backend for the Thesis Archiving and Research Publication Repository System.

## Prerequisites

- .NET 8.0 SDK or later
- SQL Server (LocalDB or full instance)
- Visual Studio 2022 or VS Code (optional)

## Setup Instructions

### 1. Install .NET SDK

Download and install from: https://dotnet.microsoft.com/download

Verify installation:
```bash
dotnet --version
```

### 2. Restore Dependencies

Navigate to the backend folder and run:
```bash
cd backend
dotnet restore
```

### 3. Database Configuration

The application uses SQL Server LocalDB by default. The connection string is in `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ThesisRepositoryDb;Trusted_Connection=true;MultipleActiveResultSets=true"
}
```

**To use a different SQL Server instance:**

1. Open `appsettings.json`
2. Update the connection string, for example:
   ```json
   "DefaultConnection": "Server=YOUR_SERVER;Database=ThesisRepositoryDb;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=true"
   ```

### 4. Create Database

The database will be automatically created when you run the application. The seed data will include:

- 5 demo user accounts
- 5 sample theses

### 5. Run the Application

```bash
dotnet run
```

Or with hot reload:
```bash
dotnet watch run
```

The API will be available at:
- **HTTP:** http://localhost:5000
- **Swagger UI:** http://localhost:5000/swagger

### 6. Update Frontend Configuration

Make sure the frontend `.env` file points to the correct API URL:
```
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication
- `POST /api/Auth/signin` - User login
- `POST /api/Auth/signup` - User registration
- `POST /api/Auth/signout` - User logout

### Users
- `GET /api/Users` - Get all users
- `GET /api/Users/{id}` - Get user by ID
- `PATCH /api/Users/{id}/status` - Update user status (approve/deactivate)

### Theses
- `GET /api/Theses` - Get all theses
- `GET /api/Theses/{id}` - Get thesis by ID
- `POST /api/Theses` - Create new thesis
- `PATCH /api/Theses/{id}` - Update thesis
- `DELETE /api/Theses/{id}` - Delete thesis
- `POST /api/Theses/upload-pdf` - Upload PDF file
- `GET /api/Theses/pdf/{fileId}` - Get PDF data

### Password Reset
- `POST /api/PasswordReset` - Create password reset request
- `GET /api/PasswordReset` - Get all reset requests
- `PATCH /api/PasswordReset/{id}` - Update reset request
- `DELETE /api/PasswordReset/{id}` - Delete reset request

## Default User Accounts

After database initialization, the following accounts are available:

| Email | Password | Role |
|-------|----------|------|
| admin@thesis.com | AdminPass123! | Administrator |
| faculty@thesis.com | password123 | Faculty |
| student@thesis.com | password123 | Student |
| uploader@thesis.com | password123 | Uploader |
| approver@thesis.com | password123 | Approver |

## Project Structure

```
backend/
├── Controllers/          # API Controllers
│   ├── AuthController.cs
│   ├── UsersController.cs
│   ├── ThesesController.cs
│   └── PasswordResetController.cs
├── Data/                 # Database Context and Seed
│   ├── ApplicationDbContext.cs
│   └── DbInitializer.cs
├── DTOs/                 # Data Transfer Objects
│   ├── AuthDTOs.cs
│   └── ThesisDTOs.cs
├── Models/               # Database Models
│   ├── User.cs
│   ├── Thesis.cs
│   └── PasswordResetRequest.cs
├── Services/             # Business Logic
│   ├── AuthService.cs
│   ├── UserService.cs
│   ├── ThesisService.cs
│   └── PasswordResetService.cs
├── Program.cs            # Application entry point
├── appsettings.json      # Configuration
└── ThesisRepository.csproj
```

## Configuration

### JWT Settings

In `appsettings.json`:
```json
"JwtSettings": {
  "Secret": "YourSuperSecretKeyForThesisRepositorySystem2024!@#$%",
  "ExpiryInDays": 7
}
```

### CORS Settings

The API is configured to allow requests from:
- http://localhost:5173 (Vite default)
- http://localhost:3000 (React default)
- http://localhost:5174 (Vite alternative)

To add more origins, update `Program.cs`:
```csharp
policy.WithOrigins("http://localhost:5173", "YOUR_ADDITIONAL_ORIGIN")
```

## Troubleshooting

### Database Connection Issues

1. **LocalDB not installed:**
   - Install SQL Server Express with LocalDB
   - Or update connection string to use full SQL Server

2. **Connection string error:**
   - Verify server name matches your SQL Server instance
   - Check credentials if using SQL Server authentication

### Port Already in Use

If port 5000 is already in use, update in `Properties/launchSettings.json` or run:
```bash
dotnet run --urls "http://localhost:YOUR_PORT"
```

### CORS Errors

Ensure the frontend origin is added to CORS policy in `Program.cs`.

## Production Deployment

For production deployment:

1. Update `appsettings.Production.json` with production settings
2. Change JWT secret to a secure random string
3. Use a production SQL Server instance
4. Enable HTTPS
5. Update CORS to only allow your production domain
6. Publish the application:
   ```bash
   dotnet publish -c Release -o ./publish
   ```

### Deploying to Render

1. Create a new Web Service on Render and connect it to this GitHub repository.
2. Set the build command to:
   ```bash
   dotnet publish -c Release -o publish
   ```
3. Set the start command to:
   ```bash
   dotnet ./publish/ThesisRepository.dll
   ```
4. Add required environment variables in the Render dashboard:
   - ConnectionStrings__DefaultConnection: your production SQL Server connection string
   - JwtSettings__Secret: a secure random JWT signing key
5. Render provides a PORT environment variable automatically; the app will bind to it.

Note: The uploads/ directory is ignored by .gitignore. For persistent file storage consider using an external object store (S3, DigitalOcean Spaces, etc.) or Render Volumes.

## License

Copyright © 2024 Thesis Repository System. All rights reserved.
>>>>>>> 7f1aece5db3daa81cf858382dc89886443b797e3
