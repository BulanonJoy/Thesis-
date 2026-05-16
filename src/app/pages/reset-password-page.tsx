import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { BookOpen, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { resetPassword } from "../../lib/mock-data";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = useMemo(() => {
    const state = (location.state ?? {}) as {
      email?: string;
    };
    const params = new URLSearchParams(location.search);

    return state.email ?? params.get("email") ?? "";
  }, [location.search, location.state]);

  const [email] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Invalid reset session", {
        description: "Please start again from Forgot Password.",
      });
      navigate("/forgot-password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Error", {
        description: "Passwords do not match.",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Error", {
        description: "Password must be at least 8 characters long.",
      });
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, newPassword);
      toast.success("Password Reset Successful", {
        description: "You can now sign in with your new password.",
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to reset password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#F4E5C2]/20 to-[#E8F5E1]/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#2D5016] to-[#4A7C2D] rounded-xl mb-4">
            <BookOpen className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-bold text-[#2D5016]">Set New Password</h1>
          <p className="text-gray-600 mt-1">Create a new password for your account</p>
        </div>

        <Card className="border-[#2D5016]/10 shadow-lg">
          <CardContent className="p-8 space-y-6">
            {email ? (
              <div className="bg-[#E8F5E1] border border-[#4A7C2D]/30 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#4A7C2D] flex-shrink-0" />
                <p className="text-sm text-[#2D5016]">
                  Verified email: <strong>{email}</strong>. Enter your new password below.
                </p>
              </div>
            ) : (
              <div className="bg-[#F4E5C2]/40 border border-[#D4AF37]/30 rounded-xl p-4">
                <p className="text-sm text-[#2D5016]">
                  Reset session not found. Start from Forgot Password to verify your email.
                </p>
                <Link to="/forgot-password" className="inline-block mt-2 text-sm text-[#4A7C2D] hover:text-[#2D5016]">
                  Go to Forgot Password
                </Link>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 border-[#2D5016]/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 border-[#2D5016]/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-[#2D5016] hover:bg-[#4A7C2D] text-white"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Resetting Password…
                  </span>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-gray-200 text-center">
              <Link to="/login" className="block text-sm text-[#4A7C2D] hover:text-[#2D5016]">
                ← Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
