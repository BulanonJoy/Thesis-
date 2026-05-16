import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router";
import { Button } from "../components/ui/button";
import { BookOpen, Search, Upload, ClipboardList, Users, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/auth-context";

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Still resolving session from Supabase
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#2D5016] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#2D5016] text-sm font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  // Use <Navigate> instead of navigate() during render to avoid the
  // "Cannot update a component while rendering a different component" warning.
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isApproved) return <Navigate to="/login" replace />;

  const userRole  = user.role;
  const userName  = user.name;
  const userTitle = user.title;

  /**
   * Navigation visibility matrix
   * admin    -> User Management
   * approver → Browse All + Review Queue
   * uploader → Browse All + Upload Thesis
   * faculty  → Browse All
   * student  → Browse All
   */
  const navigation = [
    { name: "Browse All",                 href: "/dashboard/browse",                     icon: Search,        roles: ["faculty", "student", "uploader", "approver"] },
    { name: "Upload Thesis",              href: "/dashboard/upload",                     icon: Upload,        roles: ["uploader"] },
    { name: "Review Queue",               href: "/dashboard/approvals",                  icon: ClipboardList, roles: ["approver"] },
    { name: "User Management",            href: "/dashboard/admin",                      icon: Users,         roles: ["admin"] },
  ];

  const filteredNav = navigation.filter((item) => item.roles.includes(userRole));

  const SidebarContent = () => (
    <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center flex-shrink-0 px-4 gap-3">
        <div className="w-10 h-10 bg-[#D4AF37] rounded-lg flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-[#2D5016]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">TARPS</h1>
          <p className="text-xs text-green-200">Thesis Repository</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="mx-3 mt-6 mb-2 px-3 py-2 bg-[#D4AF37]/20 rounded-lg border border-[#D4AF37]/30">
        <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wide">{userTitle}</p>
      </div>

      {/* Nav links */}
      <nav className="mt-2 flex-1 px-3 space-y-1">
        {filteredNav.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? "bg-[#D4AF37] text-[#2D5016]"
                  : "text-green-100 hover:bg-[#3D6622] hover:text-white"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User card + logout */}
      <div className="px-3 mt-auto">
        <div className="bg-[#3D6622]/50 rounded-lg p-4 mb-4">
          <p className="text-xs font-medium text-white mb-1">Logged in as</p>
          <p className="text-sm text-green-200 font-medium truncate">{userName}</p>
          <p className="text-xs text-green-300 mt-0.5">{userTitle}</p>
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-green-100 hover:bg-[#3D6622] hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-gradient-to-b from-[#2D5016] to-[#3D6622]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside
            className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-[#2D5016] to-[#3D6622]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4">
              <button onClick={() => setSidebarOpen(false)} className="text-white"><X className="w-6 h-6" /></button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm border-b border-[#2D5016]/10">
          <button type="button" className="text-[#2D5016]" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2D5016] to-[#4A7C2D] rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <span className="font-semibold text-[#2D5016]">TARPS</span>
          </div>
        </div>
        <main className="flex-1"><Outlet /></main>
      </div>
    </div>
  );
}

