import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { BookOpen, Mail } from "lucide-react";
import { checkPasswordResetStatus } from "../../lib/mock-data";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedEmail = email.trim();
      await checkPasswordResetStatus(normalizedEmail);

      toast.success("Email Verified", {
        description: "You can now set your new password.",
      });

      navigate(
        `/reset-password?email=${encodeURIComponent(normalizedEmail)}`,
        {
          state: { email: normalizedEmail },
        }
      );
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to verify email",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#F4E5C2]/20 to-[#E8F5E1]/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#2D5016] to-[#4A7C2D] rounded-xl mb-4">
            <BookOpen className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-bold text-[#2D5016]">Forgot Password</h1>
          <p className="text-gray-600 mt-1">Request password reset assistance</p>
        </div>

        <Card className="border-[#2D5016]/10 shadow-lg">
          <CardContent className="p-8 space-y-6">
            <div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Enter your registered email address below to continue directly to resetting your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-[#2D5016]/20"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2D5016] hover:bg-[#4A7C2D] text-white"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Verifying…
                  </span>
                ) : (
                  "Continue to Reset Password"
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-gray-200 space-y-2 text-center">
              <Link to="/login" className="block text-sm text-[#4A7C2D] hover:text-[#2D5016]">
                ← Back to Sign In
              </Link>
              <Link to="/" className="block text-sm text-[#4A7C2D] hover:text-[#2D5016]">
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}