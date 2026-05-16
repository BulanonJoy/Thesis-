# 🔌 API Reference - Thesis Repository System

Complete API endpoint documentation for the C# ASP.NET Core backend.

**Base URL:** `http://localhost:5000/api`

---

## 🔐 Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📋 Endpoints Overview

| Category | Endpoint | Method | Auth Required |
|----------|----------|--------|---------------|
| **Auth** | /Auth/signin | POST | No |
| **Auth** | /Auth/signup | POST | No |
| **Auth** | /Auth/signout | POST | No |
| **Users** | /Users | GET | Yes |
| **Users** | /Users/{id} | GET | Yes |
| **Users** | /Users/{id}/status | PATCH | Yes (Admin) |
| **Theses** | /Theses | GET | No* |
| **Theses** | /Theses/{id} | GET | No* |
| **Theses** | /Theses | POST | Yes |
| **Theses** | /Theses/{id} | PATCH | Yes |
| **Theses** | /Theses/{id} | DELETE | Yes (Admin) |
| **Theses** | /Theses/upload-pdf | POST | Yes |
| **Theses** | /Theses/pdf/{fileId} | GET | No* |
| **Password** | /PasswordReset | POST | No |
| **Password** | /PasswordReset | GET | Yes (Admin) |
| **Password** | /PasswordReset/{id} | PATCH | Yes (Admin) |
| **Password** | /PasswordReset/{id} | DELETE | Yes (Admin) |

*No authentication required, but guests have limited access to data

---

## 🔑 Authentication Endpoints

### 1. Sign In

**POST** `/api/Auth/signin`

Login to get a JWT token.

**Request Body:**
```json
{
  "email": "admin@thesis.com",
  "password": "AdminPass123!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin-001",
    "email": "admin@thesis.com",
    "name": "System Administrator",
    "role": "admin",
    "isApproved": true,
    "isActive": true,
    "createdAt": "2024-03-10T00:00:00Z"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Invalid email or password
- **400 Bad Request:** Account is deactivated
- **400 Bad Request:** Account pending approval

---

### 2. Sign Up

**POST** `/api/Auth/signup`

Register a new user account (requires admin approval).

**Request Body:**
```json
{
  "email": "newuser@university.edu",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "role": "student"
}
```

**Valid Roles:**
- `admin`
- `faculty`
- `student`
- `uploader`
- `approver`

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-1234567890",
    "email": "newuser@university.edu",
    "name": "John Doe",
    "role": "student",
    "isApproved": false,
    "isActive": true,
    "createdAt": "2024-03-10T12:34:56Z"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Email already exists
- **400 Bad Request:** Invalid email format
- **400 Bad Request:** Password too short (minimum 8 characters)

---

### 3. Sign Out

**POST** `/api/Auth/signout`

Sign out (client-side token removal, server doesn't track sessions).

**Response (200 OK):**
```json
{
  "message": "Signed out successfully"
}
```

---

## 👥 User Management Endpoints

### 1. Get All Users

**GET** `/api/Users`

Retrieve all registered users (typically admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "admin-001",
    "email": "admin@thesis.com",
    "name": "System Administrator",
    "role": "admin",
    "isApproved": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": "student-001",
    "email": "student@thesis.com",
    "name": "Jane Doe",
    "role": "student",
    "isApproved": true,
    "isActive": true,
    "createdAt": "2024-01-15T00:00:00Z"
  }
]
```

---

### 2. Get User by ID

**GET** `/api/Users/{id}`

Retrieve a specific user by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "student-001",
  "email": "student@thesis.com",
  "name": "Jane Doe",
  "role": "student",
  "isApproved": true,
  "isActive": true,
  "createdAt": "2024-01-15T00:00:00Z"
}
```

**Error Responses:**
- **404 Not Found:** User not found

---

### 3. Update User Status

**PATCH** `/api/Users/{id}/status`

Approve/deactivate a user (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "isApproved": true,
  "isActive": true
}
```

You can send either or both fields:
```json
{
  "isApproved": true
}
```
```json
{
  "isActive": false
}
```

**Response (200 OK):**
```json
{
  "message": "User status updated successfully"
}
```

**Error Responses:**
- **400 Bad Request:** User not found
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Not an admin

---

## 📚 Thesis Management Endpoints

### 1. Get All Theses

**GET** `/api/Theses`

Retrieve all theses (public endpoint, but guests see limited info).

**Response (200 OK):**
```json
[
  {
    "id": "thesis-001",
    "title": "Machine Learning Applications in Sustainable Energy Systems",
    "abstract": "This research explores...",
    "keywords": ["machine learning", "sustainable energy"],
    "authors": "Jane Doe, John Smith",
    "department": "Computer Engineering",
    "year": 2024,
    "pdfUrl": "pdf-1234567890",
    "status": "approved",
    "uploadedBy": "uploader-001",
    "approvedBy": "approver-001",
    "createdAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-01-20T00:00:00Z"
  }
]
```

---

### 2. Get Thesis by ID

**GET** `/api/Theses/{id}`

Retrieve a specific thesis.

**Response (200 OK):**
```json
{
  "id": "thesis-001",
  "title": "Machine Learning Applications in Sustainable Energy Systems",
  "abstract": "This research explores the application...",
  "keywords": ["machine learning", "sustainable energy", "renewable energy"],
  "authors": "Jane Doe, John Smith",
  "department": "Computer Engineering",
  "year": 2024,
  "pdfUrl": "pdf-1234567890",
  "status": "approved",
  "uploadedBy": "uploader-001",
  "approvedBy": "approver-001",
  "createdAt": "2024-01-15T00:00:00Z",
  "updatedAt": "2024-01-20T00:00:00Z"
}
```

**Error Responses:**
- **404 Not Found:** Thesis not found

---

### 3. Create Thesis

**POST** `/api/Theses`

Upload a new thesis (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "IoT-Based Smart Agriculture System",
  "abstract": "This thesis presents a comprehensive IoT-based monitoring system...",
  "keywords": ["IoT", "agriculture", "sensors"],
  "authors": "Michael Chen",
  "department": "Electrical Engineering",
  "year": 2024,
  "pdfUrl": "pdf-1234567890",
  "pdfData": "data:application/pdf;base64,JVBERi0xLjQKJ...",
  "uploadedBy": "uploader-001"
}
```

**Response (201 Created):**
```json
{
  "id": "thesis-1234567890",
  "title": "IoT-Based Smart Agriculture System",
  "abstract": "This thesis presents...",
  "keywords": ["IoT", "agriculture", "sensors"],
  "authors": "Michael Chen",
  "department": "Electrical Engineering",
  "year": 2024,
  "pdfUrl": "pdf-1234567890",
  "status": "pending",
  "uploadedBy": "uploader-001",
  "approvedBy": null,
  "createdAt": "2024-03-10T12:34:56Z",
  "updatedAt": "2024-03-10T12:34:56Z"
}
```

**Error Responses:**
- **400 Bad Request:** Validation errors
- **401 Unauthorized:** Not authenticated

---

### 4. Update Thesis

**PATCH** `/api/Theses/{id}`

Update thesis metadata or status.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (partial update):**
```json
{
  "status": "approved",
  "approvedBy": "approver-001"
}
```

Or update any fields:
```json
{
  "title": "Updated Title",
  "abstract": "Updated abstract...",
  "keywords": ["new", "keywords"],
  "status": "approved"
}
```

**Response (200 OK):**
```json
{
  "id": "thesis-001",
  "title": "Updated Title",
  "abstract": "Updated abstract...",
  "keywords": ["new", "keywords"],
  "authors": "Jane Doe",
  "department": "Computer Engineering",
  "year": 2024,
  "pdfUrl": "pdf-1234567890",
  "status": "approved",
  "uploadedBy": "uploader-001",
  "approvedBy": "approver-001",
  "createdAt": "2024-01-15T00:00:00Z",
  "updatedAt": "2024-03-10T12:34:56Z"
}
```

**Error Responses:**
- **400 Bad Request:** Thesis not found
- **401 Unauthorized:** Not authenticated

---

### 5. Delete Thesis

**DELETE** `/api/Theses/{id}`

Delete a thesis (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Thesis deleted successfully"
}
```

**Error Responses:**
- **400 Bad Request:** Thesis not found
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Not an admin

---

### 6. Upload PDF

**POST** `/api/Theses/upload-pdf`

Upload a PDF file (returns file ID).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fileData": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9UeXBlIC9QYWdlCi9QYXJlbnQgMSAwIFIKL1Jlc291cmNlcyAyIDAgUgovQ29udGVudHMgNCAwIFI+PgplbmRvYmoKNCAwIG9iago..."
}
```

**Response (200 OK):**
```json
{
  "fileId": "pdf-1234567890"
}
```

---

### 7. Get PDF Data

**GET** `/api/Theses/pdf/{fileId}`

Retrieve PDF file data by file ID.

**Response (200 OK):**
```json
{
  "data": "data:application/pdf;base64,JVBERi0xLjQKJ..."
}
```

**Error Responses:**
- **404 Not Found:** PDF not found

---

## 🔒 Password Reset Endpoints

### 1. Create Password Reset Request

**POST** `/api/PasswordReset`

Request a password reset (public endpoint).

**Request Body:**
```json
{
  "email": "faculty@thesis.com"
}
```

**Response (200 OK):**
```json
{
  "id": "reset-1234567890",
  "email": "faculty@thesis.com",
  "status": "pending",
  "requestedAt": "2024-03-10T12:34:56Z",
  "processedAt": null,
  "processedBy": null
}
```

**Error Responses:**
- **400 Bad Request:** A pending request already exists for this email

---

### 2. Get All Password Reset Requests

**GET** `/api/PasswordReset`

Get all password reset requests (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "reset-001",
    "email": "faculty@thesis.com",
    "status": "pending",
    "requestedAt": "2024-03-10T12:00:00Z",
    "processedAt": null,
    "processedBy": null
  },
  {
    "id": "reset-002",
    "email": "student@thesis.com",
    "status": "approved",
    "requestedAt": "2024-03-09T10:00:00Z",
    "processedAt": "2024-03-09T11:00:00Z",
    "processedBy": "admin-001"
  }
]
```

---

### 3. Update Password Reset Request

**PATCH** `/api/PasswordReset/{id}`

Approve or reject a password reset request (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "approved",
  "processedBy": "admin-001"
}
```

Valid statuses:
- `approved`
- `rejected`

**Response (200 OK):**
```json
{
  "id": "reset-001",
  "email": "faculty@thesis.com",
  "status": "approved",
  "requestedAt": "2024-03-10T12:00:00Z",
  "processedAt": "2024-03-10T13:00:00Z",
  "processedBy": "admin-001"
}
```

---

### 4. Delete Password Reset Request

**DELETE** `/api/PasswordReset/{id}`

Delete a password reset request (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Password reset request deleted successfully"
}
```

---

## 🧪 Testing with cURL

### Sign In
```bash
curl -X POST http://localhost:5000/api/Auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@thesis.com","password":"AdminPass123!"}'
```

### Get All Theses (with auth)
```bash
curl -X GET http://localhost:5000/api/Theses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Thesis
```bash
curl -X POST http://localhost:5000/api/Theses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Thesis",
    "abstract": "This is a test",
    "keywords": ["test"],
    "authors": "Test Author",
    "department": "Test Dept",
    "year": 2024,
    "uploadedBy": "uploader-001"
  }'
```

---

## 📊 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server error |

---

## 🔐 Authentication Flow

1. **User logs in** → POST `/api/Auth/signin`
2. **Receive JWT token** in response
3. **Store token** in localStorage/memory
4. **Include token** in Authorization header for protected endpoints
5. **Token expires** after 7 days (configurable in appsettings.json)
6. **User logs out** → Clear token from storage

---

## 🌐 CORS Configuration

The API allows requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React default)
- `http://localhost:5174` (Vite alternative)

To add more origins, update `Program.cs`.

---

## 📚 Additional Resources

- **Swagger UI:** http://localhost:5000/swagger (interactive API docs)
- **Test API directly** in browser or Postman
- **Frontend integration:** See `/src/lib/api-service.ts`

---

**Last Updated:** March 10, 2026  
**API Version:** 1.0.0
