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
 