import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  BookOpen, Mail, Lock, User, Building, Eye, EyeOff, Clock, CheckCircle,
} from "lucide-react";
import { mockSignUp, type UserRole } from "../../lib/mock-data";

interface Form {
  firstName: string; lastName: string; email: string;
  password: string; confirmPassword: string; role: string; department: string;
}
const EMPTY: Form = {
  firstName: "", lastName: "", email: "",
  password: "", confirmPassword: "", role: "", department: "",
};
const DEPARTMENTS = [
  "Computer Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
];

export function SignUpPage() {
  const [form, setForm]             = useState<Form>(EMPTY);
  const [errors, setErrors]         = useState<Partial<Form>>({});
  const [showPw, setShowPw]         = useState(false);
  const [showCp, setShowCp]         = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);

  const set = (field: keyof Form, val: string) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const validate = (): boolean => {
    const e: Partial<Form> = {};
    if (!form.firstName.trim()) e.firstName = "Required.";
    if (!form.lastName.trim())  e.lastName  = "Required.";
    if (!form.email.trim())     e.email     = "Required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email.";
    if (!form.password)         e.password  = "Required.";
    else if (form.password.length < 8) e.password = "Min. 8 characters.";
    if (!form.confirmPassword)  e.confirmPassword = "Required.";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    if (!form.role)              e.role       = "Please select a role.";
    if (!form.department)        e.department = "Please select a department.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await mockSignUp(
        form.email,
        form.password,
        `${form.firstName} ${form.lastName}`.trim(),
        form.role as UserRole,
        form.department
      );
      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      toast.error("Registration Failed", { description: msg });
      console.log("signup error:", err);
    }
    setSubmitting(false);
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#F4E5C2]/20 to-[#E8F5E1]/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-[#2D5016]/10 shadow-lg">
          <CardContent className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-[#E8F5E1] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-[#2D5016]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#2D5016] mb-2">Account Registered!</h2>
              <p className="text-gray-600">Welcome, {form.firstName} {form.lastName}.</p>
            </div>
            <div className="bg-[#F4E5C2]/60 border border-[#D4AF37]/30 rounded-xl p-5 text-left space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#B8962C]" />
                <p className="text-sm font-semibold text-[#2D5016]">Pending Admin Approval</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your account has been created but requires approval from the System Administrator
                before you can sign in. You will be notified once your role is verified.
              </p>
            </div>
            <Link
              to="/login"
              className="block w-full py-2.5 px-4 text-center bg-[#2D5016] hover:bg-[#4A7C2D] text-white rounded-lg font-medium transition-colors"
            >
              Back to Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Registration form ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#F4E5C2]/20 to-[#E8F5E1]/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#2D5016] to-[#4A7C2D] rounded-xl mb-4">
            <BookOpen className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-bold text-[#2D5016]">Create Your Account</h1>
          <p className="text-gray-600 mt-1">Join the TARPS thesis repository system</p>
        </div>

        <Card className="border-[#2D5016]/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#2D5016]">Sign Up</CardTitle>
            <CardDescription>
              Your account will be active after System Administrator approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">

              {/* Name row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <F label="First Name" error={errors.firstName}>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input name="given-name" autoComplete="given-name" placeholder="Juan"
                      value={form.firstName} onChange={(e) => set("firstName", e.target.value)}
                      className={`pl-10 border-[#2D5016]/20 ${errors.firstName ? "border-red-400" : ""}`} />
                  </div>
                </F>
                <F label="Last Name" error={errors.lastName}>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input name="family-name" autoComplete="family-name" placeholder="Dela Cruz"
                      value={form.lastName} onChange={(e) => set("lastName", e.target.value)}
                      className={`pl-10 border-[#2D5016]/20 ${errors.lastName ? "border-red-400" : ""}`} />
                  </div>
                </F>
              </div>

              {/* Email */}
              <F label="Email Address" error={errors.email}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input name="email" type="email" autoComplete="email"
                    placeholder="your.email@university.edu"
                    value={form.email} onChange={(e) => set("email", e.target.value)}
                    className={`pl-10 border-[#2D5016]/20 ${errors.email ? "border-red-400" : ""}`} />
                </div>
              </F>

              {/* Role */}
              <F label="Role" error={errors.role}>
                <Select value={form.role} onValueChange={(v) => set("role", v)}>
                  <SelectTrigger className={`border-[#2D5016]/20 ${errors.role ? "border-red-400" : ""}`}>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uploader">Thesis Uploader (Department Secretary)</SelectItem>
                    <SelectItem value="approver">Thesis Approver (Program Chair)</SelectItem>
                    <SelectItem value="faculty">Faculty Member</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </F>

              {/* Department */}
              <F label="Department" error={errors.department}>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    name="organization"
                    autoComplete="organization"
                    value={form.department}
                    onChange={(e) => set("department", e.target.value)}
                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-[#2D5016]/20 ${errors.department ? "border-red-400" : ""}`}
                  >
                    <option value="" disabled>Select a Department...</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </F>

              {/* Password row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <F label="Password" error={errors.password}>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input name="new-password" type={showPw ? "text" : "password"} autoComplete="new-password"
                      placeholder="Min. 8 characters"
                      value={form.password} onChange={(e) => set("password", e.target.value)}
                      className={`pl-10 pr-10 border-[#2D5016]/20 ${errors.password ? "border-red-400" : ""}`} />
                    <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2D5016]">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </F>
                <F label="Confirm Password" error={errors.confirmPassword}>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input name="confirm-password" type={showCp ? "text" : "password"} autoComplete="new-password"
                      placeholder="Re-enter password"
                      value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)}
                      className={`pl-10 pr-10 border-[#2D5016]/20 ${errors.confirmPassword ? "border-red-400" : ""}`} />
                    <button type="button" tabIndex={-1} onClick={() => setShowCp(!showCp)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2D5016]">
                      {showCp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </F>
              </div>

              <Button type="submit" disabled={submitting}
                className="w-full bg-[#2D5016] hover:bg-[#4A7C2D] text-white h-11">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : "Create Account"}
              </Button>
            </form>

            <div className="mt-5 p-4 bg-[#E8F5E1] rounded-lg border border-[#4A7C2D]/20 text-xs text-[#2D5016]">
              <strong>Note:</strong> All new accounts require approval from the System Administrator
              before gaining access to the repository.
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-[#4A7C2D] hover:text-[#2D5016] font-medium">Sign In</Link>
          </p>
          <Link to="/" className="text-sm text-[#4A7C2D] hover:text-[#2D5016] block mt-1">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

function F({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label} <span className="text-red-500">*</span>
      </Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
