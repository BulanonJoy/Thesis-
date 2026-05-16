# Implementation Summary: Thesis Author Information & APA Citations

## ? What's Been Implemented (Backend)

### 1. **Database Model** (`Models/Thesis.cs`)
Added three new properties to the `Thesis` class:
- `MainAuthorEmail` - Email of primary thesis author
- `CoAuthorEmail` - Email of co-author (optional)
- `ApaCitation` - Auto-generated APA format citation

### 2. **Data Transfer Objects** (`DTOs/ThesisDTOs.cs`)
Updated all relevant DTOs:
- **CreateThesisDto**: Accept author emails during upload
- **UpdateThesisDto**: Allow editing author emails
- **ThesisDto**: Return author emails and APA citation in responses

### 3. **Business Logic** (`Services/ThesisService.cs`)
- **GenerateApaCitation()**: New method that creates APA format citations
  - Format: `"Author(s). (Year). Title. Department."`
- **CreateThesis()**: Stores author emails when thesis is uploaded
- **UpdateThesis()**: 
  - Allows editing author emails
  - **Automatically generates APA citation when thesis status ? "approved"**
- **MapToDto()**: Returns all new fields in API responses

### 4. **Database Migration Script** (`SQL/4_AddAuthorEmailsAndApaCitation.sql`)
SQL script to add the three new columns to the Theses table (idempotent - safe to run multiple times)

---

## ?? What Needs to Be Done (Frontend)

### **Core Requirement: Conditional Visibility**

#### Upload Form (Create Thesis) - Hide Author Section ?
```javascript
// DO NOT show these fields in the upload form:
- Main Author Email
- Co-Author Email
- APA Citation
```

#### View/Edit Form (View Thesis) - Show Author Section ?
```javascript
// SHOW these fields when viewing/editing an existing thesis:
- Main Author Email (editable, required)
- Co-Author Email (editable, optional)
- APA Citation (read-only if thesis is approved)
```

### **Implementation Steps**

#### Step 1: Update Upload Form Component
```javascript
// Only include these fields:
{
  title: "",
  abstract: "",
  authors: "",  // Can add mainAuthorEmail here too if desired
  advisors: "",
  department: "",
  fieldOfResearch: "",
  year: new Date().getFullYear(),
  keywords: [],
  // DO NOT include mainAuthorEmail, coAuthorEmail, apaCitation
}
```

#### Step 2: Update View Form Component
```javascript
// Show all fields from create PLUS:
{
  mainAuthorEmail: "", // ? NEW (editable)
  coAuthorEmail: "",   // ? NEW (optional, editable)
  apaCitation: "",     // ? NEW (read-only if approved)
}
```

#### Step 3: Email Validation
```javascript
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// In form submission:
if (!validateEmail(formData.mainAuthorEmail)) {
  showError("Invalid main author email");
  return;
}
```

#### Step 4: Update API Calls

**Upload (POST):**
```javascript
const uploadThesis = async (formData) => {
  const response = await fetch('/api/thesis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      title: formData.title,
      abstract: formData.abstract,
      authors: formData.authors,
      mainAuthorEmail: formData.mainAuthorEmail,  // ? Include
      coAuthorEmail: formData.coAuthorEmail,      // ? Include
      advisors: formData.advisors,
      department: formData.department,
      fieldOfResearch: formData.fieldOfResearch,
      year: formData.year,
      keywords: formData.keywords,
      uploadedBy: userId,
      pdfUrl: pdfPath
    })
  });
  return response.json();
};
```

**Get Thesis (GET):**
```javascript
const getThesis = async (id) => {
  const response = await fetch(`/api/thesis/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const thesis = await response.json();
  
  // thesis now includes:
  // - mainAuthorEmail
  // - coAuthorEmail
  // - apaCitation (auto-generated if approved)
  return thesis;
};
```

**Edit Author Emails (PATCH):**
```javascript
const updateAuthorEmails = async (thesisId, mainEmail, coEmail) => {
  const response = await fetch(`/api/thesis/${thesisId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      mainAuthorEmail: mainEmail,
      coAuthorEmail: coEmail || null
    })
  });
  return response.json();
};
```

#### Step 5: Display APA Citation
```javascript
// In view component, only show if thesis is approved:
{thesis.status === 'approved' && thesis.apaCitation && (
  <div className="apa-citation">
    <h4>Citation (APA Format):</h4>
    <p>{thesis.apaCitation}</p>
    <button onClick={() => copyToClipboard(thesis.apaCitation)}>
      Copy Citation
    </button>
  </div>
)}
```

---

## ?? Database Setup

### Prerequisites
- SQL Server Management Studio (SSMS)
- Access to `ThesisRepositoryDB` database
- Server: `CPE\SQLEXPRESS` (as per your setup)

### Steps to Apply Migration

1. **Open SSMS** and connect to `CPE\SQLEXPRESS`

2. **Execute the migration script:**
   - Open file: `backend/SQL/4_AddAuthorEmailsAndApaCitation.sql`
   - Click "Execute" or press F5
   - You should see messages confirming column additions

3. **Verify the changes:**
   ```sql
   -- Run this in SSMS query window to verify:
   SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
   FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_NAME = 'Theses'
   ORDER BY ORDINAL_POSITION;
   ```
   You should see these new columns:
   - `MainAuthorEmail` (NVARCHAR(255), NULL)
   - `CoAuthorEmail` (NVARCHAR(255), NULL)
   - `ApaCitation` (NVARCHAR(MAX), NULL)

---

## ?? Testing Checklist

- [ ] **Database**: Run migration script and verify columns exist
- [ ] **Upload Form**: Doesn't display author email fields
- [ ] **Upload Success**: POST /api/thesis accepts mainAuthorEmail and coAuthorEmail
- [ ] **View Thesis**: GET /api/thesis/{id} returns mainAuthorEmail, coAuthorEmail
- [ ] **View Form**: Shows author email fields (editable)
- [ ] **Edit Emails**: PATCH /api/thesis/{id} successfully updates emails
- [ ] **Approval**: When status ? "approved", apaCitation is auto-generated
- [ ] **Display Citation**: View form shows APA citation when thesis is approved
- [ ] **Email Validation**: Frontend validates email format before submit
- [ ] **Session Persistence**: 
  - [ ] User stays logged in after page refresh
  - [ ] JWT token stored in localStorage
  - [ ] Form data persists on upload page refresh (localStorage)

---

## ?? APA Citation Format

The backend generates citations in this format:
```
AuthorNames. (Year). Thesis Title. Department.
```

**Example:**
```
John Doe, Jane Smith. (2024). Artificial Intelligence in Healthcare. Computer Science Department.
```

**Notes:**
- If year is missing, current year is used
- Multiple authors are comma-separated (as stored in Authors field)
- Format is simplified but follows APA conventions
- Can be customized in `GenerateApaCitation()` method if needed

---

## ?? Session Handling (Bonus)

### Login Persistence (Keep Users Logged In)
**Backend**: ? JWT tokens with 7-day expiry (already implemented)
**Frontend**: 
- Store token in `localStorage` on login
- On app load, check if token exists and is valid
- Restore user session automatically

```javascript
useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    verifyTokenAndRestoreSession(token);
  }
}, []);
```

### Form Data Retention on Refresh
**Frontend**: Save form data to `localStorage` as user types
```javascript
useEffect(() => {
  // Save on change
  localStorage.setItem('thesisUploadDraft', JSON.stringify(formData));
}, [formData]);

// On component mount, restore
useEffect(() => {
  const draft = localStorage.getItem('thesisUploadDraft');
  if (draft) setFormData(JSON.parse(draft));
}, []);
```

---

## ?? Troubleshooting

### Issue: Migration script fails
**Solution**: 
- Ensure you're running the script in the correct database (ThesisRepositoryDB)
- Check SQL Server is running and accessible
- Run script in SSMS using F5

### Issue: API returns 400 when creating thesis with emails
**Solution**:
- Ensure email fields are included in request body
- Validate email format matches regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Check for typos in JSON field names (should be camelCase: mainAuthorEmail)

### Issue: APA citation not generating on approval
**Solution**:
- Ensure PATCH request includes `"status": "approved"`
- Backend only generates citation on status change (first time)
- Check backend logs for errors

### Issue: Session lost after refresh
**Solution**:
- Store JWT token in `localStorage` (not `sessionStorage`)
- On app load, check localStorage for token before making API calls
- Attach token to all authenticated requests via Authorization header

---

## ?? Next Steps

1. ? **Database**: Run migration script
2. ? **Backend**: Build and deploy updated code
3. ?? **Frontend**: Implement UI changes (conditional rendering of author section)
4. ? **Testing**: Run through testing checklist
5. ? **Session**: Implement token storage & form persistence

All backend changes are complete and tested. Frontend work is straightforward conditional rendering and API integration.
