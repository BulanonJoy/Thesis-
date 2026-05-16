import { Link } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { BookOpen, CheckCircle } from "lucide-react";

export function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#F4E5C2]/20 to-[#E8F5E1]/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#2D5016] to-[#4A7C2D] rounded-xl mb-4">
            <BookOpen className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-bold text-[#2D5016]">Thesis Repository</h1>
          <p className="text-gray-600 mt-1">Full-Stack ASP.NET Core + SQL Server</p>
        </div>

        <Card className="border-[#2D5016]/10 shadow-lg">
          <CardContent className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-[#E8F5E1] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-[#2D5016]" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#2D5016] mb-2">System Ready</h2>
              <p className="text-gray-600">
                The backend is connected to SQL Server (ThesisRepositoryDB) via the C# ASP.NET Core API.
              </p>
            </div>

            <div className="bg-[#F4E5C2]/60 border border-[#D4AF37]/30 rounded-xl p-5 text-left space-y-3">
              <h3 className="text-sm font-semibold text-[#2D5016]">Quick Start Checklist:</h3>
              <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                <li>Run <code className="text-xs bg-white/70 px-1 rounded">2_AlterDatabase.sql</code> in SSMS</li>
                <li>Start backend: <code className="text-xs bg-white/70 px-1 rounded">dotnet run</code> (port 5000)</li>
                <li>Start frontend: <code className="text-xs bg-white/70 px-1 rounded">pnpm dev</code></li>
                <li>Sign in with your seeded admin credentials</li>
              </ul>
            </div>

            <Link to="/login">
              <Button className="w-full bg-[#2D5016] hover:bg-[#4A7C2D] text-white">
                Go to Login
              </Button>
            </Link>

            <Link to="/" className="block text-sm text-[#4A7C2D] hover:text-[#2D5016]">
              ← Back to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}