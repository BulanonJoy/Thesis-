# ⚡ Quick Start Guide

Get the Thesis Repository System running in 5 minutes!

## Prerequisites Check

Open terminal/command prompt and verify:

```bash
# Check .NET SDK (should be 8.0+)
dotnet --version

# Check Node.js (should be 18+)
node --version

# Check if pnpm is installed
pnpm --version

# If pnpm is not installed:
npm install -g pnpm
```

If any command fails, install the missing prerequisite first.

---

## 🚀 Method 1: Automated Start (Easiest)

### Windows:
```bash
start-app.bat
```

### Linux/Mac:
```bash
chmod +x start-app.sh
./start-app.sh
```

This will automatically start both backend and frontend!

---

## 🚀 Method 2: Manual Start

### Step 1: Start Backend

Open Terminal 1:
```bash
cd backend
dotnet restore
dotnet run
```

Wait for this message:
```
Now listening on: http://localhost:5000
```

### Step 2: Start Frontend

Open Terminal 2 (new window/tab):
```bash
pnpm install
pnpm dev
```

Wait for this message:
```
Local: http://localhost:5173/
```

---

## 🌐 Access the Application

Open your browser and go to:
```
http://localhost:5173
```

---

## 🔑 Login

Use these credentials:

**Administrator:**
- Email: `admin@thesis.com`
- Password: `AdminPass123!`

**Other Roles:**
- Faculty: `faculty@thesis.com` / `password123`
- Student: `student@thesis.com` / `password123`
- Uploader: `uploader@thesis.com` / `password123`
- Approver: `approver@thesis.com` / `password123`

---

## ✅ Verify Everything Works

1. **Login Test:**
   - Go to http://localhost:5173/login
   - Enter admin credentials
   - Should redirect to admin dashboard

2. **Browse Theses:**
   - Login as student or faculty
   - Click "Browse All"
   - Should see 5 sample theses

3. **Backend API:**
   - Go to http://localhost:5000/swagger
   - Should see API documentation

---

## 🛑 Stop the Application

### If using automated script:
- Press `Ctrl+C` in the terminal windows

### If running manually:
- Press `Ctrl+C` in both terminal windows (backend and frontend)

---

## 🐛 Common Issues

### Issue: Port 5000 already in use
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Issue: Database error
**Solution:**
- Ensure SQL Server is installed and running
- For LocalDB: `sqllocaldb start mssqllocaldb`

### Issue: CORS error in browser
**Solution:**
- Make sure backend is running at http://localhost:5000
- Check that .env file has: `VITE_API_URL=http://localhost:5000/api`

### Issue: "Cannot find module" in frontend
**Solution:**
```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

---

## 📚 Next Steps

- **Full Documentation:** See [PROJECT_README.md](PROJECT_README.md)
- **Detailed Setup:** See [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **File Structure:** See [FILES_MANIFEST.md](FILES_MANIFEST.md)
- **Backend Docs:** See [backend/README.md](backend/README.md)

---

## 🎯 Quick Command Reference

```bash
# Backend Commands
cd backend
dotnet restore          # Install dependencies
dotnet build            # Build project
dotnet run              # Run application
dotnet watch run        # Run with hot reload

# Frontend Commands
pnpm install            # Install dependencies
pnpm dev                # Start dev server
pnpm build              # Build for production
pnpm preview            # Preview production build

# Database Commands
sqllocaldb start        # Start LocalDB (Windows)
sqllocaldb stop         # Stop LocalDB (Windows)
```

---

## 📞 Need Help?

1. Check error messages in terminal
2. Check browser console (F12)
3. Review [SETUP_GUIDE.md](SETUP_GUIDE.md)
4. Verify all prerequisites are installed
5. Make sure both backend and frontend are running

---

**That's it! You should now have the application running. Happy coding! 🎉**
