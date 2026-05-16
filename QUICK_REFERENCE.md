# Quick Reference: Backend vs Frontend Responsibility

## ?? Your Implementation Tasks

### **Backend (? COMPLETE)**
- [x] Added `MainAuthorEmail`, `CoAuthorEmail`, `ApaCitation` fields to Thesis model
- [x] Updated DTOs to accept and return author email fields
- [x] Implemented `GenerateApaCitation()` method
- [x] Auto-generate APA citation when thesis is approved
- [x] All API endpoints ready to receive and return author data
- [x] Build successful - no errors

### **Database (? YOUR ACTION REQUIRED)**
Run this SQL migration:
```bash
# File: backend/SQL/4_AddAuthorEmailsAndApaCitation.sql
# Location: SQL Server Management Studio
# Database: ThesisRepositoryDB
# Just open and execute (press F5)
```

### **Frontend (?? NEXT TASK)**

#### **Upload Form**
```javascript
// HIDE: mainAuthorEmail, coAuthorEmail, apaCitation fields
// Show: title, abstract, authors, advisors, department, fieldOfResearch, year, keywords, pdf
```

#### **View/Edit Form**
```javascript
// Show: all upload fields PLUS
// NEW: mainAuthorEmail (editable, required)
// NEW: coAuthorEmail (editable, optional)
// NEW: apaCitation (read-only)
```

#### **Key Logic**
1. **Show author section based on mode:**
   ```javascript
   {isViewMode && <AuthorSection />}
   {!isViewMode && <HideAuthorSection />}
   ```

2. **Save form data to localStorage:**
   ```javascript
   // Restore on page reload
   const [form, setForm] = useState(() => 
     JSON.parse(localStorage.getItem('thesisUploadDraft')) || {}
   );
   // Save on change
   useEffect(() => 
     localStorage.setItem('thesisUploadDraft', JSON.stringify(form)), [form]
   );
   ```

3. **Store JWT token on login:**
   ```javascript
   // On successful login
   localStorage.setItem('authToken', response.token);
   // On app load
   const token = localStorage.getItem('authToken');
   if (token) restoreSession(token);
   ```

---

## ?? API Endpoints Overview

### **Create Thesis (Upload Form)**
```
POST /api/thesis
Body: {
  title, abstract, authors, mainAuthorEmail, coAuthorEmail,
  advisors, department, fieldOfResearch, year, keywords, uploadedBy, pdfUrl
}
Response: { id, title, ..., mainAuthorEmail, coAuthorEmail, apaCitation: null }
```

### **Get Thesis (View Form)**
```
GET /api/thesis/{id}
Response: { id, title, ..., mainAuthorEmail, coAuthorEmail, apaCitation: null }
         (apaCitation is populated if status === "approved")
```

### **Update Thesis (Edit Form)**
```
PATCH /api/thesis/{id}
Body: { mainAuthorEmail, coAuthorEmail, ... }
Response: Updated thesis object
```

### **Approve Thesis**
```
PATCH /api/thesis/{id}
Body: { status: "approved", approvedBy: userId }
Response: { ..., apaCitation: "Author(s). (2024). Title. Department." }
         ? Auto-generated on first approval
```

---

## ?? Quick Test

### Test Backend is Ready
```bash
# 1. Start backend
dotnet run

# 2. In Postman/Thunder Client, create thesis:
POST http://localhost:5000/api/thesis
{
  "title": "Test Thesis",
  "abstract": "Test abstract",
  "authors": "John Doe",
  "mainAuthorEmail": "john@university.edu",
  "coAuthorEmail": "jane@university.edu",
  "advisors": "Prof. Smith",
  "department": "Computer Science",
  "fieldOfResearch": "AI",
  "year": 2024,
  "keywords": ["ai", "ml"],
  "uploadedBy": "1",
  "pdfUrl": "uploads/test.pdf"
}

# Expected response includes mainAuthorEmail, coAuthorEmail
```

### Test Database Migration
```sql
-- In SSMS, run this to verify:
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Theses' AND COLUMN_NAME IN ('MainAuthorEmail', 'CoAuthorEmail', 'ApaCitation');
-- Should return 3 rows
```

---

## ?? Implementation Order

1. **First**: Run SQL migration script (SQL/4_AddAuthorEmailsAndApaCitation.sql)
2. **Second**: Verify database columns exist
3. **Third**: Build backend (should be successful)
4. **Fourth**: Start backend API
5. **Fifth**: Frontend - implement conditional visibility for author section
6. **Sixth**: Frontend - add localStorage for form persistence
7. **Seventh**: Frontend - add localStorage for JWT token
8. **Eighth**: Test complete flow

---

## ? Code References

### **Model Change**
File: `Models/Thesis.cs`
```csharp
public string? MainAuthorEmail { get; set; }
public string? CoAuthorEmail { get; set; }
public string? ApaCitation { get; set; }
```

### **DTO Changes**
File: `DTOs/ThesisDTOs.cs`
- CreateThesisDto: Added mainAuthorEmail, coAuthorEmail
- UpdateThesisDto: Added mainAuthorEmail, coAuthorEmail
- ThesisDto: Added mainAuthorEmail, coAuthorEmail, apaCitation

### **Service Logic**
File: `Services/ThesisService.cs`
- CreateThesis(): Stores author emails
- UpdateThesis(): Generates citation on approval
- GenerateApaCitation(): New method for APA format

---

## ?? APA Citation Example

**Input:**
- Authors: "John Doe, Jane Smith"
- Year: 2024
- Title: "Artificial Intelligence in Healthcare"
- Department: "Computer Science"

**Generated Citation:**
```
John Doe, Jane Smith. (2024). Artificial Intelligence in Healthcare. Computer Science.
```

---

## ?? Session Persistence (Both Frontend & Backend)

### Backend (? Ready)
- JWT tokens issued with 7-day expiry
- Tokens are stateless (no server session needed)
- Just validate token on each request

### Frontend (? Do This)
```javascript
// On login - save token
localStorage.setItem('authToken', response.token);

// On app load - restore session
const token = localStorage.getItem('authToken');
if (token) {
  // Verify token is still valid
  const userResponse = await fetch('/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (userResponse.ok) {
    // User is still logged in
    setUser(userResponse.user);
  } else {
    // Token expired
    localStorage.removeItem('authToken');
  }
}

// On logout
localStorage.removeItem('authToken');
```

---

## ? FAQ

**Q: Should author emails be in the upload form?**
A: No. They should only be shown/editable when viewing an existing thesis.

**Q: Is APA citation auto-calculated?**
A: Yes, by backend when status changes to "approved".

**Q: Can APA citation be edited?**
A: No, it's read-only. It's auto-generated to ensure consistency.

**Q: Where should session data be stored?**
A: localStorage (not sessionStorage) so it persists after browser close.

**Q: What if user manually clears localStorage?**
A: They'll be logged out - this is expected behavior.

---

Generated: 2024
Backend Status: ? Complete
Frontend Status: ? Pending Implementation
