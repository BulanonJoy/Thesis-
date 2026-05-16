import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Search, Filter, BookOpen, User, Calendar, Lock, LogIn, Tag, Building,
  AlertCircle, RefreshCw,
} from "lucide-react";
import { searchTheses } from "../../lib/mock-data";

interface Thesis {
  id: string;
  title: string;
  authors: string;
  department: string;
  year: number;
  abstract: string;
  keywords: string[];
}

const DEPARTMENTS = [
  "Computer Engineering", "Electrical Engineering", "Mechanical Engineering",
  "Civil Engineering", "Electronics Engineering", "Industrial Engineering",
  "Chemical Engineering",
];

const RESEARCH_TYPES = [
  "White Paper",
  "Published Research",
];

export function GuestBrowsePage() {
  const [theses, setTheses]           = useState<Thesis[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState<string | null>(null);
  const [department, setDepartment]   = useState("all");
  const [researchType, setResearchType] = useState("all");
  const [year, setYear]               = useState("all");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(currentYear - i));

  const fetchTheses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const filtered = await searchTheses({
        query: search,
        department: department !== "all" ? department : null,
        researchType: researchType !== "all" ? researchType : null,
        year: year !== "all" ? parseInt(year, 10) : null,
        status: "approved",
      });

      // Map to expected format - guests only see limited info
      const mapped: Thesis[] = filtered.map(t => ({
        id: t.id,
        title: t.title,
        authors: t.authors,
        department: t.department,
        year: t.year,
        abstract: t.abstract,
        keywords: t.keywords,
      }));

      setTheses(mapped);
    } catch (err) {
      setError("Failed to load theses.");
      console.log("guest browse fetch error:", err);
    }
    setLoading(false);
  }, [search, department, researchType, year]);

  useEffect(() => { fetchTheses(); }, [fetchTheses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = searchInput.trim();
    setSearch(normalized.length > 0 ? normalized : null);
  };

  const clearFilters = () => {
    setSearchInput(""); setSearch(null); setDepartment("all"); setResearchType("all"); setYear("all");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#F4E5C2]/20 to-[#E8F5E1]/30">
      {/* Header with login prompt */}
      <div className="bg-white border-b border-[#2D5016]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2D5016] to-[#4A7C2D] rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <span className="text-xl font-bold text-[#2D5016]">TARPS</span>
            </Link>

            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600 hidden sm:block">
                Limited access — sign in for full details
              </p>
              <Link to="/login">
                <Button size="sm" className="bg-[#2D5016] hover:bg-[#4A7C2D] text-white">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2D5016]">Browse Theses</h1>
            <p className="text-gray-600 mt-1">Public access — title, abstract, and keywords only</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchTheses} disabled={loading}
            className="border-[#2D5016]/30 text-[#2D5016] hover:bg-[#E8F5E1] flex-shrink-0">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Guest notice */}
        <Card className="mb-6 border-[#D4AF37]/30 bg-[#F4E5C2]/40">
          <CardContent className="p-5 flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#B8962C] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-[#2D5016] mb-1">Guest Access</h3>
              <p className="text-sm text-gray-600">
                You are viewing as a guest. Only title, abstract, and keywords are shown.{" "}
                <Link to="/login" className="text-[#4A7C2D] hover:underline font-medium">
                  Sign in
                </Link>{" "}
                to access full thesis details and PDF downloads.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6 border-[#2D5016]/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-[#4A7C2D]" />
              <h2 className="text-lg font-semibold text-[#2D5016]">Filters</h2>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by title or keywords..."
                  value={searchInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchInput(value);
                    if (value.trim().length === 0) {
                      setSearch(null);
                    }
                  }}
                  className="pl-10 border-[#2D5016]/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Department
                  </label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="border-[#2D5016]/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {DEPARTMENTS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Research Type
                  </label>
                  <Select value={researchType} onValueChange={setResearchType}>
                    <SelectTrigger className="border-[#2D5016]/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {RESEARCH_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Year
                  </label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="border-[#2D5016]/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {years.map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end gap-2">
                  <Button type="submit" className="flex-1 bg-[#2D5016] hover:bg-[#4A7C2D] text-white">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                  <Button type="button" variant="outline" onClick={clearFilters}
                    className="border-[#2D5016]/30 text-[#2D5016] hover:bg-[#E8F5E1]">
                    Clear
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-[#2D5016]">
              <div className="w-6 h-6 border-2 border-[#2D5016]/30 border-t-[#2D5016] rounded-full animate-spin" />
              <span>Loading theses...</span>
            </div>
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && theses.length === 0 && (
          <Card className="border-[#D4AF37]/30 bg-[#F4E5C2]/20">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-[#B8962C] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#2D5016] mb-2">No Theses Found</h3>
              <p className="text-gray-600">
                {search || department !== "all" || year !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "No approved theses are available yet."}
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && theses.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Showing <strong className="text-[#2D5016]">{theses.length}</strong> thes{theses.length === 1 ? "is" : "es"}
            </p>

            <div className="space-y-4">
              {theses.map((thesis) => (
                <Card key={thesis.id} className="border-[#2D5016]/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-[#2D5016] mb-2">
                      {thesis.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        {thesis.authors}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building className="w-4 h-4" />
                        {thesis.department}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {thesis.year}
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-4">{thesis.abstract}</p>

                    <div className="flex flex-wrap gap-2">
                      {thesis.keywords.map((keyword, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-[#E8F5E1] text-[#2D5016] border-[#4A7C2D]/20">
                          <Tag className="w-3 h-3 mr-1" />
                          {keyword}
                        </Badge>
                      ))}
                    </div>

                    {/* Full access prompt */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between gap-4">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Sign in to view full details and download PDF
                      </p>
                      <Link to="/login">
                        <Button size="sm" variant="outline" className="border-[#2D5016]/30 text-[#2D5016] hover:bg-[#E8F5E1]">
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
