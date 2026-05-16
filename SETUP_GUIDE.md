# Complete Setup Guide - Thesis Repository System

This guide will help you set up and run both the frontend (React + TypeScript) and backend (C# ASP.NET Core) of the Thesis Repository System.

## Prerequisites

### Required Software

1. **Node.js** (v18 or later)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **.NET 8.0 SDK**
   - Download: https://dotnet.microsoft.com/download
   - Verify: `dotnet --version`

3. **SQL Server** (One of the following):
   - SQL Server LocalDB (recommended for development)
   - SQL Server Express
   - SQL Server Full Edition
   - Download: https://www.microsoft.com/sql-server/sql-server-downloads

4. **pnpm** (Package Manager)
   - Install: `npm install -g pnpm`
   - Verify: `pnpm --version`

### Optional Tools

- **Visual Studio Code** - For frontend development
- **Visual Studio 2022** - For backend development
- **SQL Server Management Studio (SSMS)** - For database management

---

## Step 1: Clone or Download the Project

If you have the project in a zip file, extract it. Otherwise:

```bash
git clone <repository-url>
cd thesis-repository-system
```

---

## Step 2: Backend Setup (C#)

### 2.1 Navigate to Backend Folder

```bash
cd backend
```

### 2.2 Restore NuGet Packages

```bash
dotnet restore
```

### 2.3 Configure Database Connection

Open `appsettings.json` and verify the connection string:

**For LocalDB (Default):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ThesisRepositoryDb;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

**For SQL Server Express:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=ThesisRepositoryDb;Trusted_Connection=true;TrustServerCertificate=true"
  }
}
```

**For SQL Server with Authentication:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=ThesisRepositoryDb;User Id=YOUR_USERNAME;Password=YOUR_PASSWORD;TrustServerCertificate=true"
  }
}
```

### 2.4 Run the Backend

```bash
dotnet run
```

Or with hot reload during development:
```bash
dotnet watch run
```

**Expected Output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started.
```

### 2.5 Verify Backend is Running

Open your browser and navigate to:
- **Swagger UI:** http://localhost:5000/swagger

You should see the API documentation.

### 2.6 Test Database Seed Data

The database is automatically created and seeded with:
- 5 demo user accounts
- 5 sample theses

**Leave the backend running** and open a new terminal for frontend setup.

---

## Step 3: Frontend Setup (React)

### 3.1 Open New Terminal

Open a new terminal window/tab and navigate to the project root.

### 3.2 Install Frontend Dependencies

```bash
pnpm install
```

### 3.3 Configure Environment Variables

Create or verify the `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3.4 Run the Frontend

```bash
pnpm dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3.5 Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:5173/

---

## Step 4: Login to the System

Use one of the following demo accounts:

| Email | Password | Role | Access |
|-------|----------|------|--------|
| admin@thesis.com | AdminPass123! | Administrator | User Management, Password Resets |
| faculty@thesis.com | password123 | Faculty | Browse Theses |
| student@thesis.com | password123 | Student | Browse Theses |
| uploader@thesis.com | password123 | Uploader | Browse, Upload Theses |
| approver@thesis.com | password123 | Approver | Browse, Approve/Reject Theses |

---

## Step 5: Verify Everything Works

### 5.1 Test Login
1. Go to http://localhost:5173/login
2. Use `admin@thesis.com` / `AdminPass123!`
3. You should be redirected to the admin dashboard

### 5.2 Test User Management
1. Click on "User Management" in the sidebar
2. You should see all registered users
3. Try approving/deactivating a user

### 5.3 Test Thesis Management
1. Logout and login as `uploader@thesis.com` / `password123`
2. Click on "Upload Thesis"
3. Fill in the form and submit
4. Logout and login as `approver@thesis.com` / `password123`
5. Go to "Review Queue"
6. You should see the thesis pending approval

### 5.4 Test Password Reset
1. Logout
2. Click "Forgot Password"
3. Enter any registered email (e.g., faculty@thesis.com)
4. Submit the request
5. Login as admin
6. Go to "Password Reset Requests"
7. You should see the request and can approve/reject it

---

## Project Structure

```
thesis-repository-system/
├── backend/                      # C# ASP.NET Core Backend
│   ├── Controllers/              # API Controllers
│   ├── Data/                     # Database Context
│   ├── DTOs/                     # Data Transfer Objects
│   ├── Models/                   # Entity Models
│   ├── Services/                 # Business Logic
│   ├── Program.cs                # Application Entry
│   ├── appsettings.json          # Configuration
│   └── ThesisRepository.csproj   # Project File
├── src/                          # React Frontend
│   ├── app/
│   │   ├── components/           # Reusable Components
│   │   ├── contexts/             # React Contexts
│   │   ├── layouts/              # Layout Components
│   │   ├── pages/                # Page Components
│   │   └── routes.tsx            # Route Configuration
│   ├── lib/
│   │   ├── api-service.ts        # API Client
│   │   └── mock-data.ts          # Data Adapter
│   └── styles/                   # CSS Styles
├── .env                          # Environment Variables
├── package.json                  # Frontend Dependencies
├── SETUP_GUIDE.md                # This file
└── README.md                     # Project Documentation
```

---

## Common Issues and Solutions

### Issue 1: Backend won't start - "Port already in use"

**Solution:**
```bash
# Kill the process using port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or run on a different port
dotnet run --urls "http://localhost:5001"
# Then update frontend .env: VITE_API_URL=http://localhost:5001/api
```

### Issue 2: Database connection error

**Solution:**
1. Verify SQL Server is running
2. Check connection string in `appsettings.json`
3. For LocalDB, ensure it's installed:
   ```bash
   sqllocaldb info
   ```

### Issue 3: CORS errors in browser

**Solution:**
1. Ensure backend is running
2. Check CORS configuration in `backend/Program.cs`
3. Verify frontend origin is allowed
4. Clear browser cache

### Issue 4: Frontend can't connect to backend

**Solution:**
1. Verify backend is running at http://localhost:5000
2. Check `.env` file has correct `VITE_API_URL`
3. Open browser console (F12) to see actual error
4. Test API directly at http://localhost:5000/swagger

### Issue 5: "Cannot restore NuGet packages"

**Solution:**
```bash
# Clear NuGet cache
dotnet nuget locals all --clear

# Restore again
dotnet restore
```

### Issue 6: TypeScript errors in frontend

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

---

## Development Workflow

### Running Both Frontend and Backend

**Terminal 1 (Backend):**
```bash
cd backend
dotnet watch run
```

**Terminal 2 (Frontend):**
```bash
pnpm dev
```

### Making Changes

**Backend Changes:**
- Edit C# files
- The app will auto-reload with `dotnet watch run`
- Check Swagger UI for API changes

**Frontend Changes:**
- Edit React/TypeScript files
- Vite will auto-reload the browser
- Check browser console for errors

### Database Changes

If you need to reset the database:

1. Stop the backend
2. Delete the database:
   ```bash
   # Using SSMS or command line
   DROP DATABASE ThesisRepositoryDb;
   ```
3. Restart the backend (will recreate and seed)

---

## Production Deployment

### Backend Deployment

1. Update `appsettings.Production.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "YOUR_PRODUCTION_CONNECTION_STRING"
     },
     "JwtSettings": {
       "Secret": "GENERATE_A_SECURE_RANDOM_STRING_HERE"
     }
   }
   ```

2. Publish the application:
   ```bash
   dotnet publish -c Release -o ./publish
   ```

3. Deploy to your hosting service (IIS, Azure, AWS, etc.)

### Frontend Deployment

1. Update `.env.production`:
   ```env
   VITE_API_URL=https://your-api-domain.com/api
   ```

2. Build for production:
   ```bash
   pnpm build
   ```

3. Deploy the `dist` folder to your hosting service (Netlify, Vercel, AWS S3, etc.)

---

## Support

For issues or questions:
1. Check this guide thoroughly
2. Review error messages in terminal/browser console
3. Check backend logs
4. Verify all services are running

---

## License

Copyright © 2024 Thesis Repository System. All rights reserved.
