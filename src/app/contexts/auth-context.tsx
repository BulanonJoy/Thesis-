import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  mockSignIn, 
  mockSignOut, 
  getCurrentUser, 
  getStoredUserId,
  getUserById,
  initializeMockData,
  type User,
  type UserRole as MockUserRole
} from "../../lib/mock-data";
import { getAuthToken, getTokenExpiryMs } from "../../lib/api-service";

export type UserRole = MockUserRole;

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  isApproved: boolean;
  isActive: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AppUser>;
  signOut: () => Promise<void>;
}

// Create context with undefined to force usage within provider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function roleTitle(role: string): string {
  switch (role) {
    case "admin":    return "System Administrator";
    case "uploader": return "Department Secretary";
    case "approver": return "Program Chair";
    case "faculty":  return "Faculty Member";
    case "student":  return "Student";
    default:         return "User";
  }
}

function mapUserToAppUser(user: User): AppUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    title: roleTitle(user.role),
    isApproved: user.is_approved,
    isActive: user.is_active,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize mock data on mount
    initializeMockData();

    // Restore existing session
    const restoreSession = async () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(mapUserToAppUser(currentUser));
        setLoading(false);
        return;
      }

      const userId = getStoredUserId();
      const token = getAuthToken();
      if (!token || !userId) {
        setLoading(false);
        return;
      }

      try {
        const restoredUser = await getUserById(userId);
        setUser(mapUserToAppUser(restoredUser));
      } catch {
        mockSignOut();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void restoreSession();
  }, []);

  useEffect(() => {
    if (!user) return;

    const token = getAuthToken();
    if (!token) {
      setUser(null);
      return;
    }

    const expiryMs = getTokenExpiryMs(token);
    if (!expiryMs) {
      mockSignOut();
      setUser(null);
      return;
    }

    const remainingMs = expiryMs - Date.now();
    if (remainingMs <= 0) {
      mockSignOut();
      setUser(null);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      mockSignOut();
      setUser(null);
    }, remainingMs);

    return () => window.clearTimeout(timeoutId);
  }, [user]);

  const signIn = async (email: string, password: string): Promise<AppUser> => {
    const user = await mockSignIn(email, password);
    const appUser = mapUserToAppUser(user);
    setUser(appUser);
    return appUser;
  };

  const signOut = async () => {
    mockSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // During development hot reloads, this might be called before provider is ready
    // Return a safe default to prevent crashes during HMR
    if (import.meta.env.DEV) {
      console.warn("useAuth called outside AuthProvider - this may be due to hot module reloading");
      return {
        user: null,
        loading: false,
        signIn: async () => {
          throw new Error("Auth not initialized");
        },
        signOut: async () => {
          throw new Error("Auth not initialized");
        },
      } as AuthContextType;
    }
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
