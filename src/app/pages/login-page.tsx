import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../components/ui/card";
import {
  BookOpen, Mail, Lock, Eye, EyeOff, Clock, ShieldAlert, LogOut,
} from "lucide-react";
import { useAuth, UserRole } from "../contexts/auth-context";

function getRoleRedirect(role: UserRole): string {
  switch (role) {
    case "admin":    return "/dashboard/admin";
    case "approver": return "/dashboard/approvals";
    case "uploader": return "/dashboard/upload";
    default:         return "/dashboard/browse";   // faculty, student
  }
}

// ── Pending approval overlay ──────────────────────────────────────────────────
function PendingOverlay({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#FAFAF8] via-[#F4E5C2]/20 to-[#E8F5E1]/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-24 h-24 bg-[#F4E5C2] rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-12 h-12 text-[#B8962C]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#2D5016] mb-2">Pending Admin Approval</h1>
          <p className="text-gray-600 leading-relaxed">
            Your account has been registered and is currently under review by the System
            Administrator. You'll receive access once your identity and role have been verified.
          </p>
        </div>
        <Card className="border-[#D4AF37]/30 bg-[#F4E5C2]/40 text-left">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-[#B8962C] flex-shrink-0" />
              <p className="text-sm font-semibold text-[#2D5016]">What happens next?</p>
            </div>
            <ul className="text-sm text-gray-600 space-y-2 pl-8 list-disc">
              <li>The Admin reviews your role and identity.</li>
              <li>Once approved, your account becomes active.</li>
              <li>You can then sign in and access the repository.</li>
            </ul>
          </CardContent>
        </Card>
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
          <span className="ml-2 text-sm text-gray-500">Awaiting approval…</span>
        </div>
        <Button
          variant="outline"
          onClick={onSignOut}
          className="border-[#2D5016]/30 text-[#2D5016] hover:bg-[#E8F5E1] w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

// ── Main login page ───────────────────────────────────────────────────────────
export function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();
  const { user, signIn, signOut } = useAuth();

  useEffect(() => {
    if (user?.isApproved) {
      navigate(getRoleRedirect(user.role), { replace: true });
    }
  }, [navigate, user]);

  // Unapproved user signed in → show overlay instead of dashboard
  if (user && !user.isApproved) {
    return <PendingOverlay onSignOut={signOut} />;
  }

  if (user?.isApproved) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const appUser = await signIn(email.trim(), password);
      if (!appUser.isApproved) {
        // Stay on page — overlay renders above
        setLoading(false);
        return;
      }
      navigate(getRoleRedirect(appUser.role));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed.";
      toast.error("Sign In Failed", { description: msg });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#F4E5C2]/20 to-[#E8F5E1]/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#2D5016] to-[#4A7C2D] rounded-xl mb-4">
            <BookOpen className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-bold text-[#2D5016]">Welcome Back</h1>
          <p className="text-gray-600 mt-1">Sign in to access the thesis repository</p>
        </div>

        {/* Card */}
        <Card className="border-[#2D5016]/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#2D5016]">Sign In</CardTitle>
            <CardDescription>Enter your registered email and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email" name="email" type="email" autoComplete="username"
                    placeholder="your.email@university.edu"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-[#2D5016]/20" required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-[#4A7C2D] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password" name="password"
                    type={showPw ? "text" : "password"} autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-[#2D5016]/20" required
                  />
                  <button
                    type="button" tabIndex={-1}
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2D5016]"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit" disabled={loading}
                className="w-full bg-[#2D5016] hover:bg-[#4A7C2D] text-white h-11"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#4A7C2D] hover:text-[#2D5016] font-medium">
              Sign Up
            </Link>
          </p>
          <Link to="/" className="text-sm text-[#4A7C2D] hover:text-[#2D5016] block">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
