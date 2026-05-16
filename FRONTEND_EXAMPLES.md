# Frontend Implementation Examples

## 1. Conditional Form Rendering

### Upload Form (Hide Author Section)
```javascript
import React, { useState, useEffect } from 'react';

const ThesisUploadForm = () => {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('thesisUploadDraft');
    return saved ? JSON.parse(saved) : {
      title: '',
      abstract: '',
      authors: '',
      advisors: '',
      department: '',
      fieldOfResearch: '',
      year: new Date().getFullYear(),
      keywords: []
      // NOTE: mainAuthorEmail, coAuthorEmail NOT included here
    };
  });

  const [pdf, setPdf] = useState(null);

  // Save form to localStorage on change
  useEffect(() => {
    localStorage.setItem('thesisUploadDraft', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/thesis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          ...formData,
          uploadedBy: localStorage.getItem('userId'),
          pdfUrl: pdf?.path
        })
      });

      if (response.ok) {
        localStorage.removeItem('thesisUploadDraft'); // Clear draft
        alert('Thesis uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Upload Thesis</h2>

      <div>
        <label>Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label>Abstract *</label>
        <textarea
          name="abstract"
          value={formData.abstract}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label>Authors *</label>
        <input
          type="text"
          name="authors"
          value={formData.authors}
          onChange={handleInputChange}
          placeholder="John Doe, Jane Smith"
          required
        />
      </div>

      <div>
        <label>Advisors *</label>
        <input
          type="text"
          name="advisors"
          value={formData.advisors}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label>Department *</label>
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label>Field of Research *</label>
        <input
          type="text"
          name="fieldOfResearch"
          value={formData.fieldOfResearch}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label>Year *</label>
        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label>Keywords</label>
        <input
          type="text"
          placeholder="ai, machine learning, nlp"
          onChange={(e) => setFormData(prev => ({
            ...prev,
            keywords: e.target.value.split(',').map(k => k.trim())
          }))}
        />
      </div>

      <div>
        <label>PDF File *</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setPdf(e.target.files[0])}
          required
        />
      </div>

      {/* AUTHOR EMAIL SECTION - HIDDEN IN UPLOAD FORM */}
      {/* <div>
        <label>Main Author Email</label>
        <input type="email" ... />
      </div>
      <div>
        <label>Co-Author Email</label>
        <input type="email" ... />
      </div> */}

      <button type="submit">Upload Thesis</button>
    </form>
  );
};

export default ThesisUploadForm;
```

---

## 2. View/Edit Form (Show Author Section)

```javascript
import React, { useState, useEffect } from 'react';

const ThesisViewForm = ({ thesisId }) => {
  const [thesis, setThesis] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    mainAuthorEmail: '',
    coAuthorEmail: ''
  });
  const [error, setError] = useState('');

  // Fetch thesis on component mount
  useEffect(() => {
    fetchThesis();
  }, [thesisId]);

  const fetchThesis = async () => {
    try {
      const response = await fetch(`/api/thesis/${thesisId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      const data = await response.json();
      setThesis(data);
      setEditData({
        mainAuthorEmail: data.mainAuthorEmail || '',
        coAuthorEmail: data.coAuthorEmail || ''
      });
    } catch (error) {
      setError('Failed to fetch thesis');
      console.error(error);
    }
  };

  const validateEmail = (email) => {
    if (!email) return true; // Empty is ok for co-author
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEmails = async () => {
    // Validation
    if (!validateEmail(editData.mainAuthorEmail)) {
      setError('Invalid main author email format');
      return;
    }
    if (editData.coAuthorEmail && !validateEmail(editData.coAuthorEmail)) {
      setError('Invalid co-author email format');
      return;
    }
    if (!editData.mainAuthorEmail) {
      setError('Main author email is required');
      return;
    }

    try {
      const response = await fetch(`/api/thesis/${thesisId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          mainAuthorEmail: editData.mainAuthorEmail,
          coAuthorEmail: editData.coAuthorEmail || null
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setThesis(updated);
        setIsEditing(false);
        setError('');
        alert('Author emails updated successfully!');
      }
    } catch (error) {
      setError('Failed to update emails');
      console.error(error);
    }
  };

  if (!thesis) return <div>Loading...</div>;

  return (
    <div className="thesis-view">
      <h2>{thesis.title}</h2>

      {/* Basic Info - Always Visible */}
      <section className="thesis-info">
        <h3>Thesis Information</h3>
        <p><strong>Title:</strong> {thesis.title}</p>
        <p><strong>Abstract:</strong> {thesis.abstract}</p>
        <p><strong>Authors:</strong> {thesis.authors}</p>
        <p><strong>Advisors:</strong> {thesis.advisors}</p>
        <p><strong>Department:</strong> {thesis.department}</p>
        <p><strong>Field of Research:</strong> {thesis.fieldOfResearch}</p>
        <p><strong>Year:</strong> {thesis.year}</p>
        <p><strong>Status:</strong> {thesis.status}</p>
      </section>

      {/* AUTHOR EMAIL SECTION - ONLY VISIBLE WHEN VIEWING */}
      <section className="author-info" style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd' }}>
        <h3>Author Information</h3>
        
        {isEditing ? (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label>Main Author Email *</label>
              <input
                type="email"
                value={editData.mainAuthorEmail}
                onChange={(e) => handleEmailChange('mainAuthorEmail', e.target.value)}
                style={{ width: '100%', padding: '0.5rem' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Co-Author Email</label>
              <input
                type="email"
                value={editData.coAuthorEmail}
                onChange={(e) => handleEmailChange('coAuthorEmail', e.target.value)}
                style={{ width: '100%', padding: '0.5rem' }}
                placeholder="Optional"
              />
            </div>

            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            <button onClick={handleSaveEmails} style={{ marginRight: '0.5rem' }}>
              Save Emails
            </button>
            <button onClick={() => setIsEditing(false)} style={{ background: '#666' }}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <p><strong>Main Author Email:</strong> {thesis.mainAuthorEmail || 'Not set'}</p>
            <p><strong>Co-Author Email:</strong> {thesis.coAuthorEmail || 'Not set'}</p>
            {thesis.status === 'approved' && (
              <button onClick={() => setIsEditing(true)}>
                Edit Author Emails
              </button>
            )}
          </>
        )}
      </section>

      {/* APA CITATION SECTION - ONLY VISIBLE WHEN APPROVED */}
      {thesis.status === 'approved' && thesis.apaCitation && (
        <section className="citation-info" style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5' }}>
          <h3>Citation (APA Format)</h3>
          <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
            {thesis.apaCitation}
          </p>
          <button onClick={() => {
            navigator.clipboard.writeText(thesis.apaCitation);
            alert('Citation copied to clipboard!');
          }}>
            Copy Citation
          </button>
        </section>
      )}

      {/* PDF Viewer */}
      {thesis.pdfUrl && (
        <section className="pdf-viewer" style={{ marginTop: '2rem' }}>
          <h3>PDF Preview</h3>
          <iframe
            src={`/api/thesis/file/${thesis.pdfUrl}`}
            style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}
            title="Thesis PDF"
          />
        </section>
      )}
    </div>
  );
};

export default ThesisViewForm;
```

---

## 3. Authentication & Session Management

```javascript
import React, { useContext, useEffect } from 'react';

// Create Auth Context
const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  // Restore session on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      // Optional: Add a /api/auth/verify endpoint to check if token is still valid
      // For now, just assume token is valid
      setToken(token);
      // You can parse JWT to get user info without making API call:
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      });
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('authToken');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Store token
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.user.id);
        setToken(data.token);
        setUser(data.user);
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('thesisUploadDraft'); // Clear draft on logout
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 4. API Helper Functions

```javascript
// api.js or apiService.js

const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
});

export const thesisAPI = {
  // Create thesis (upload)
  create: async (thesisData) => {
    const response = await fetch(`${API_BASE_URL}/thesis`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(thesisData)
    });
    return response.json();
  },

  // Get single thesis
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/thesis/${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Get all theses
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/thesis`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Search theses
  search: async (query, department, fieldOfResearch, year, status) => {
    const params = new URLSearchParams({
      ...(query && { query }),
      ...(department && { department }),
      ...(fieldOfResearch && { fieldOfResearch }),
      ...(year && { year }),
      ...(status && { status })
    });
    const response = await fetch(`${API_BASE_URL}/thesis/search?${params}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Update thesis (including author emails)
  update: async (id, updates) => {
    const response = await fetch(`${API_BASE_URL}/thesis/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return response.json();
  },

  // Delete thesis
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/thesis/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Approve thesis (triggers APA citation generation)
  approve: async (id, approvedBy) => {
    return thesisAPI.update(id, {
      status: 'approved',
      approvedBy
    });
  },

  // Reject thesis
  reject: async (id, rejectionReason) => {
    return thesisAPI.update(id, {
      status: 'rejected',
      rejectionReason
    });
  }
};

export const authAPI = {
  signin: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  signup: async (signupData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });
    return response.json();
  }
};
```

---

## 5. Usage Examples

### Use in Upload Form
```javascript
import { thesisAPI } from './api';

const handleUpload = async (formData) => {
  try {
    const result = await thesisAPI.create({
      ...formData,
      mainAuthorEmail: 'john@university.edu',  // ? Include this
      coAuthorEmail: 'jane@university.edu',    // ? Include this
      uploadedBy: localStorage.getItem('userId')
    });
    console.log('Thesis created:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Use in View Form
```javascript
import { thesisAPI } from './api';

const ThesisDetail = ({ thesisId }) => {
  const [thesis, setThesis] = useState(null);

  useEffect(() => {
    thesisAPI.getById(thesisId).then(setThesis);
  }, [thesisId]);

  if (!thesis) return <div>Loading...</div>;

  return (
    <div>
      <h2>{thesis.title}</h2>
      <p>Main Author: {thesis.mainAuthorEmail}</p>
      <p>Co-Author: {thesis.coAuthorEmail}</p>
      {thesis.status === 'approved' && (
        <p>Citation: {thesis.apaCitation}</p>
      )}
    </div>
  );
};
```

---

## Summary

- **Upload Form**: Hide author section, save form to localStorage
- **View Form**: Show author section with edit capability
- **API Calls**: Include mainAuthorEmail & coAuthorEmail in requests
- **Session**: Store JWT token in localStorage, restore on app load
- **Citations**: Auto-generated by backend, display in view mode only
