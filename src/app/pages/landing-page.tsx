import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { BookOpen, Search, Shield, Users, FileCheck, Eye } from "lucide-react";
import { useAuth, type UserRole } from "../contexts/auth-context";

function getRoleRedirect(role: UserRole): string {
  switch (role) {
    case "admin":    return "/dashboard/admin";
    case "approver": return "/dashboard/approvals";
    case "uploader": return "/dashboard/upload";
    default:         return "/dashboard/browse";
  }
}

export function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user?.isApproved) {
      navigate(getRoleRedirect(user.role), { replace: true });
    }
  }, [loading, navigate, user]);

  if (loading || user?.isApproved) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#F4E5C2]/20 to-[#E8F5E1]/30">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2D5016] to-[#4A7C2D] rounded-lg flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-[#D4AF37]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#2D5016]">TARPS</h1>
              <p className="text-xs text-[#4A7C2D]">Thesis Archive & Research Publication System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" className="border-[#2D5016] text-[#2D5016] hover:bg-[#E8F5E1]">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-[#2D5016] hover:bg-[#4A7C2D] text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-[#E8F5E1] text-[#2D5016] rounded-full text-sm font-medium border border-[#4A7C2D]/20">
              Engineering Research Repository
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#2D5016] mb-6 leading-tight">
            Centralized Access to
            <span className="block text-[#D4AF37]">Engineering Excellence</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            A secure platform for storing, managing, and accessing engineering theses and research publications with advanced search capabilities and controlled access.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-[#2D5016] hover:bg-[#4A7C2D] text-white px-8">
                Get Started
              </Button>
            </Link>
            <Link to="/browse">
              <Button size="lg" variant="outline" className="border-[#2D5016] text-[#2D5016] hover:bg-[#E8F5E1]">
                Browse as Guest
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#2D5016] mb-3">System Features</h2>
          <p className="text-gray-600">Comprehensive tools for thesis management and research access</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="border-[#2D5016]/10 hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-[#E8F5E1] rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-[#2D5016]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D5016] mb-2">Advanced Search</h3>
              <p className="text-gray-600">
                Search and filter by engineering program, field of research, year, keywords, and more.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#2D5016]/10 hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-[#F4E5C2] rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D5016] mb-2">Secure Access</h3>
              <p className="text-gray-600">
                Role-based authentication ensures controlled access with view-only permissions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#2D5016]/10 hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-[#E8F5E1] rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-[#4A7C2D]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D5016] mb-2">Approval Workflow</h3>
              <p className="text-gray-600">
                Streamlined process for uploading, reviewing, and approving thesis submissions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#2D5016]/10 hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-[#F4E5C2] rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D5016] mb-2">View-Only Access</h3>
              <p className="text-gray-600">
                Built-in PDF viewer protects intellectual property while enabling knowledge sharing.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#2D5016]/10 hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-[#E8F5E1] rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[#2D5016]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D5016] mb-2">Multi-Role Support</h3>
              <p className="text-gray-600">
                Distinct permissions for administrators, uploaders, approvers, faculty, and students.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#2D5016]/10 hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-[#F4E5C2] rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D5016] mb-2">Rich Metadata</h3>
              <p className="text-gray-600">
                Comprehensive information including title, authors, advisers, abstract, and keywords.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-[#2D5016] to-[#4A7C2D] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-[#D4AF37] mb-2">1,247</div>
              <div className="text-sm text-green-100">Theses Archived</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#D4AF37] mb-2">8</div>
              <div className="text-sm text-green-100">Engineering Programs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#D4AF37] mb-2">2,840</div>
              <div className="text-sm text-green-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#D4AF37] mb-2">15+</div>
              <div className="text-sm text-green-100">Research Fields</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2026 Thesis Archiving and Research Publication Repository System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
