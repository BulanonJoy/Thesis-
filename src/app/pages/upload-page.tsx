import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import {
  Upload, FileText, CheckCircle, Clock, XCircle, Calendar,
  Building, RefreshCw, AlertCircle, FilePlus, X, FileUp, Eye,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { getAllTheses, createThesis, uploadPDF } from "../../lib/mock-data";

const UPLOAD_FORM_DRAFT_KEY = "thesisUploadDraft";

interface UploadedThesis {
  id: string;
  title: string;
  department: string;
  year: number;
  created_at: string;
  status: "pending" | "approved" | "rejected";
}

type ThesisStatusFilter = "all" | "pending" | "approved" | "rejected";

const DEPARTMENTS = [
  "Computer Engineering", "Electrical Engineering", "Mechanical Engineering",
  "Civil Engineering", "Electronics Engineering", "Industrial Engineering",
  "Chemical Engineering",
];

const FIELDS_OF_RESEARCH = [
  "Artificial Intelligence", "Machine Learning", "Internet of Things",
  "Cybersecurity", "Distributed Systems", "Robotics and Automation",
  "Renewable Energy", "Structural Engineering", "Environmental Engineering",
  "Biomedical Engineering", "Electronics and Communications", "Control Systems",
  "Data Science", "Computer Networks", "Software Engineering", "Other",
];

const RESEARCH_TYPES = [
  "White Paper",
  "Published Research",
  "Unpublished Paper",
];

const EMPTY_FORM = {
  title: "", mainAuthorName: "", coAuthorName: "", mainAuthorEmail: "", coAuthorEmail: "", advisors: "", department: "",
  fieldOfResearch: "", year: "", abstract: "", keywords: "", researchType: "", doi: "",
};

const REQUIRED_FORM_FIELDS: Array<{ key: keyof typeof EMPTY_FORM; label: string }> = [
  { key: "title", label: "Thesis Title" },
  { key: "mainAuthorName", label: "Main Author Name" },
  { key: "mainAuthorEmail", label: "Main Author Email" },
  { key: "advisors", label: "Thesis Adviser(s)" },
  { key: "department", label: "Department" },
  { key: "year", label: "Year" },
  { key: "fieldOfResearch", label: "Field of Research" },
  { key: "researchType", label: "Research Type" },
  { key: "abstract", label: "Abstract" },
  { key: "keywords", label: "Keywords" },
];
type RequiredFieldKey = keyof typeof EMPTY_FORM | "pdfFile";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isUploadFormDraft(value: unknown): value is typeof EMPTY_FORM {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;

  return Object.keys(EMPTY_FORM).every(
    (key) => typeof candidate[key] === "string"
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge className="bg-[#E8F5E1] text-[#2D5016]"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
  if (status === "rejected") return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
  return <Badge className="bg-[#F4E5C2] text-[#B8962C]"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
}

export function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const formDraftStorageKey = UPLOAD_FORM_DRAFT_KEY;
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [myTheses, setMyTheses]     = useState<UploadedThesis[]>([]);
  const [loadingTheses, setLoadingTheses] = useState(true);
  const [thesesError, setThesesError]     = useState("");
  const [activeTab, setActiveTab]         = useState("upload");
  const [statusFilter, setStatusFilter]   = useState<ThesisStatusFilter>("all");
  const [fieldErrors, setFieldErrors]     = useState<Partial<Record<RequiredFieldKey, string>>>({});

  // PDF state
  const [pdfFile, setPdfFile]       = useState<File | null>(null);
  const [dragOver, setDragOver]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!formDraftStorageKey) return;

    const stored = localStorage.getItem(formDraftStorageKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (isUploadFormDraft(parsed)) {
        setFormData(parsed);
      } else {
        localStorage.removeItem(formDraftStorageKey);
      }
    } catch {
      localStorage.removeItem(formDraftStorageKey);
    }
  }, [formDraftStorageKey]);

  useEffect(() => {
    if (!formDraftStorageKey) return;
    localStorage.setItem(formDraftStorageKey, JSON.stringify(formData));
  }, [formData, formDraftStorageKey]);

  // ── Fetch my uploads ──────────────────────────────────────────────────────
  const fetchMyTheses = useCallback(async () => {
    if (!user?.id) return;
    setLoadingTheses(true);
    setThesesError("");
    try {
      const allTheses = await getAllTheses();
      const mine = allTheses.filter(t => t.uploaded_by === user.id);
      setMyTheses(mine.map(t => ({
        id:         t.id,
        title:      t.title,
        department: t.department,
        year:       t.year,
        created_at: t.created_at,
        status:     t.status,
      })));
    } catch (err) {
      setThesesError("Failed to load your uploads.");
      console.error("fetchMyTheses error:", err);
    }
    setLoadingTheses(false);
  }, [user?.id]);

  useEffect(() => { fetchMyTheses(); }, [fetchMyTheses]);

  // ── PDF helpers ───────────────────────────────────────────────────────────
  const handlePdfFile = (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Invalid File", { description: "Only PDF files are accepted." });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File Too Large", { description: "PDF must be under 50 MB." });
      return;
    }
    setPdfFile(file);
    setFieldErrors((prev) => ({ ...prev, pdfFile: undefined }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePdfFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePdfFile(file);
  };

  // ── Form submission ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const nextErrors: Partial<Record<RequiredFieldKey, string>> = {};
    REQUIRED_FORM_FIELDS.forEach(({ key }) => {
      if (!formData[key].trim()) {
        nextErrors[key] = "Please fill out this field.";
      }
    });
    if (!pdfFile) {
      nextErrors.pdfFile = "Please fill out this field.";
    }
    if (formData.mainAuthorEmail.trim() && !EMAIL_REGEX.test(formData.mainAuthorEmail.trim())) {
      nextErrors.mainAuthorEmail = "Please enter a valid email address.";
    }
    if (formData.coAuthorEmail.trim() && !EMAIL_REGEX.test(formData.coAuthorEmail.trim())) {
      nextErrors.coAuthorEmail = "Please enter a valid email address.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      const pdfUrl = await uploadPDF(pdfFile);

      const keywordsArray = formData.keywords
        .split(",")
        .map(k => k.trim())
        .filter(k => k.length > 0);

      await createThesis({
        title:            formData.title,
        abstract:         formData.abstract,
        keywords:         keywordsArray,
        authors:          formData.coAuthorName.trim()
          ? `${formData.mainAuthorName.trim()}, ${formData.coAuthorName.trim()}`
          : formData.mainAuthorName.trim(),
        advisors:         formData.advisors.trim(),
        department:       formData.department,
        field_of_research: formData.fieldOfResearch || formData.department,
        year:             parseInt(formData.year),
        pdf_url:          pdfUrl,
        status:           "pending",
        uploaded_by:      user.id,
        mainAuthorName:   formData.mainAuthorName.trim(),
        coAuthorName:     formData.coAuthorName.trim(),
        mainAuthorEmail:  formData.mainAuthorEmail.trim(),
        coAuthorEmail:    formData.coAuthorEmail.trim() || null,
        doi:              formData.doi?.trim() || null,
        research_type:    formData.researchType.trim(),
        approved_by:      null,
        approved_at:      null,
        rejection_reason: null,
      });

      toast.success("Thesis Uploaded", {
        description: "Your thesis has been submitted for approval.",
      });

      setFormData(EMPTY_FORM);
      if (formDraftStorageKey) {
        localStorage.removeItem(formDraftStorageKey);
      }
      setPdfFile(null);
      setActiveTab("history");
      fetchMyTheses();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      toast.error("Upload Failed", { description: msg });
    }
    setSubmitting(false);
  };

  const set = (field: keyof typeof EMPTY_FORM, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);
  const openThesisUploadView = (thesisId: string) => {
    navigate(`/dashboard/thesis/${thesisId}`);
  };
  const filteredMyTheses = myTheses.filter((thesis) =>
    statusFilter === "all" ? true : thesis.status === statusFilter
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D5016] flex items-center gap-3">
          <Upload className="w-8 h-8" />
          Upload Thesis
        </h1>
        <p className="text-gray-600 mt-1">Submit theses for approval and review</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#E8F5E1]">
          <TabsTrigger value="upload" className="data-[state=active]:bg-[#2D5016] data-[state=active]:text-white">
            <FilePlus className="w-4 h-4 mr-2" />New Upload
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#2D5016] data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />My Uploads
          </TabsTrigger>
        </TabsList>

        {/* ── Upload Form ─────────────────────────────────────────────────── */}
        <TabsContent value="upload" className="space-y-6">
          <Card className="border-[#2D5016]/10">
            <CardHeader>
              <CardTitle className="text-[#2D5016]">Thesis Information</CardTitle>
              <CardDescription>
                Fill in all required fields. The thesis will be reviewed before publication.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Thesis Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => set("title", e.target.value)}
                    placeholder="Enter the full title of the thesis"
                    required
                    className={fieldErrors.title ? "border-red-500 focus-visible:ring-red-500/40" : "border-[#2D5016]/20"}
                  />
                  {fieldErrors.title && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{fieldErrors.title}</span>
                    </div>
                  )}
                </div>

                {/* Multi-Author Instructions */}
                <div className="rounded-md border border-[#4A7C2D]/20 bg-[#E8F5E1]/30 p-3">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <span className="font-semibold text-[#2D5016]">Multiple Authors:</span> You can add up to 2 main authors (Main Author Name and Co-Author Name). For theses with 3 or more authors, please list additional authors in the Main Author Name field separated by commas.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mainAuthorName">Main Author Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="mainAuthorName"
                      value={formData.mainAuthorName}
                      onChange={e => set("mainAuthorName", e.target.value)}
                      placeholder="e.g., Juan Dela Cruz"
                      required
                      className={fieldErrors.mainAuthorName ? "border-red-500 focus-visible:ring-red-500/40" : "border-[#2D5016]/20"}
                    />
                    {fieldErrors.mainAuthorName && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{fieldErrors.mainAuthorName}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coAuthorName">Co-Author Name</Label>
                    <Input
                      id="coAuthorName"
                      value={formData.coAuthorName}
                      onChange={e => set("coAuthorName", e.target.value)}
                      placeholder="e.g., Maria Santos"
                      className={fieldErrors.coAuthorName ? "border-red-500 focus-visible:ring-red-500/40" : "border-[#2D5016]/20"}
                    />
                    {fieldErrors.coAuthorName && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{fieldErrors.coAuthorName}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mainAuthorEmail">Main Author Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="mainAuthorEmail"
                      type="email"
                      value={formData.mainAuthorEmail}
                      onChange={e => set("mainAuthorEmail", e.target.value)}
                      placeholder="main.author@university.edu"
                      required
                      className={fieldErrors.mainAuthorEmail ? "border-red-500 focus-visible:ring-red-500/40" : "border-[#2D5016]/20"}
                    />
                    {fieldErrors.mainAuthorEmail && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{fieldErrors.mainAuthorEmail}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coAuthorEmail">Co-Author Email</Label>
                    <Input
                      id="coAuthorEmail"
                      type="email"
                      value={formData.coAuthorEmail}
                      onChange={e => set("coAuthorEmail", e.target.value)}
                      placeholder="co.author@university.edu"
                      className={fieldErrors.coAuthorEmail ? "border-red-500 focus-visible:ring-red-500/40" : "border-[#2D5016]/20"}
                    />
                    {fieldErrors.coAuthorEmail && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{fieldErrors.coAuthorEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Advisors */}
                <div className="space-y-2">
                  <Label htmlFor="advisors">Thesis Adviser(s) <span className="text-red-500">*</span></Label>
                  <Input
                    id="advisors"
                    value={formData.advisors}
                    onChange={e => set("advisors", e.target.value)}
                    placeholder="e.g., Dr. John Smith"
                    required
                    className={fieldErrors.advisors ? "border-red-500 focus-visible:ring-red-500/40" : "border-[#2D5016]/20"}
                  />
                  {fieldErrors.advisors && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{fieldErrors.advisors}</span>
                    </div>
                  )}
                </div>

                {/* DOI (optional) */}
                <div className="space-y-2">
                  <Label htmlFor="doi">DOI (optional)</Label>
                  <Input
                    id="doi"
                    value={(formData as any).doi}
                    onChange={e => set("doi" as keyof typeof EMPTY_FORM, e.target.value)}
                    placeholder="e.g., 10.1234/abcd.2025"
                    className="border-[#2D5016]/20"
                  />
                </div>

                {/* Department & Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                  <Select value={formData.department} onValueChange={v => set("department", v)}>
                    <SelectTrigger className={fieldErrors.department ? "border-red-500 focus:ring-red-500/40" : "border-[#2D5016]/20"}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.department && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{fieldErrors.department}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year <span className="text-red-500">*</span></Label>
                    <Select value={formData.year} onValueChange={v => set("year", v)}>
                      <SelectTrigger className={fieldErrors.year ? "border-red-500 focus:ring-red-500/40" : "border-[#2D5016]/20"}>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(y => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.year && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{fieldErrors.year}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Research Type */}
                <div className="space-y-2">
                  <Label htmlFor="researchType">Research Type <span className="text-red-500">*</span></Label>
                  <Select value={formData.researchType} onValueChange={v => set("researchType", v)}>
                    <SelectTrigger className={fieldErrors.researchType ? "border-red-500 focus:ring-red-500/40" : "border-[#2D5016]/20"}>
                      <SelectValue placeholder="Select research type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESEARCH_TYPES.map(rt => (
                        <SelectItem key={rt} value={rt}>{rt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.researchType && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{fieldErrors.researchType}</span>
                    </div>
                  )}
                </div>

                {/* Field of Research */}
                <div className="space-y-2">
                  <Label htmlFor="fieldOfResearch">Field of Research <span className="text-red-500">*</span></Label>
                  <Select value={formData.fieldOfResearch} onValueChange={v => set("fieldOfResearch", v)}>
                    <SelectTrigger className={fieldErrors.fieldOfResearch ? "border-red-500 focus:ring-red-500/40" : "border-[#2D5016]/20"}>
                      <SelectValue placeholder="Select field of research" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELDS_OF_RESEARCH.map(f => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.fieldOfResearch && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{fieldErrors.fieldOfResearch}</span>
                    </div>
                  )}
                </div>

                {/* Abstract */}
                <div className="space-y-2">
                  <Label htmlFor="abstract">Abstract <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="abstract"
                    value={formData.abstract}
                    onChange={e => set("abstract", e.target.value)}
                    placeholder="Provide a concise summary of the research..."
                    rows={6}
                    required
                    className={fieldErrors.abstract ? "border-red-500 focus-visible:ring-red-500/40 resize-none" : "border-[#2D5016]/20 resize-none"}
                  />
                  {fieldErrors.abstract && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{fieldErrors.abstract}</span>
                    </div>
                  )}
                </div>

                {/* Keywords */}
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords <span className="text-red-500">*</span></Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={e => set("keywords", e.target.value)}
                    placeholder="machine learning, renewable energy, IoT (comma-separated)"
                    required
                    className={fieldErrors.keywords ? "border-red-500 focus-visible:ring-red-500/40" : "border-[#2D5016]/20"}
                  />
                  {fieldErrors.keywords && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{fieldErrors.keywords}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Separate keywords with commas</p>
                </div>

                {/* PDF Upload */}
                <div className="space-y-2">
                  <Label>PDF Document <span className="text-red-500">*</span></Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      fieldErrors.pdfFile
                        ? "border-red-500 bg-red-50/40"
                        : dragOver
                          ? "border-[#4A7C2D] bg-[#E8F5E1]/50"
                          : "border-[#2D5016]/30 hover:border-[#4A7C2D]"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={e => { e.preventDefault(); setDragOver(false); }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    {!pdfFile ? (
                      <div className="space-y-3">
                        <FileUp className="w-12 h-12 text-[#4A7C2D] mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-[#2D5016]">
                            Drop your PDF here, or click to browse
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Maximum file size: 50 MB</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="border-[#2D5016]/30 text-[#2D5016] hover:bg-[#E8F5E1]"
                        >
                          Select PDF
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-[#E8F5E1] rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-[#2D5016]" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-[#2D5016]">{pdfFile.name}</p>
                            <p className="text-xs text-gray-600">
                              {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setPdfFile(null)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {fieldErrors.pdfFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{fieldErrors.pdfFile}</span>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#2D5016] hover:bg-[#4A7C2D] text-white h-11"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit for Approval
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Upload History ───────────────────────────────────────────────── */}
        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <p className="text-sm text-gray-600">Your uploaded theses</p>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value: ThesisStatusFilter) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[170px] border-[#2D5016]/30 text-[#2D5016]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMyTheses}
                disabled={loadingTheses}
                className="border-[#2D5016]/30 text-[#2D5016] hover:bg-[#E8F5E1]"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingTheses ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {loadingTheses && (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-[#2D5016]">
                <div className="w-6 h-6 border-2 border-[#2D5016]/30 border-t-[#2D5016] rounded-full animate-spin" />
                <span>Loading...</span>
              </div>
            </div>
          )}

          {thesesError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700">{thesesError}</p>
              </CardContent>
            </Card>
          )}

          {!loadingTheses && !thesesError && myTheses.length === 0 && (
            <Card className="border-[#D4AF37]/30 bg-[#F4E5C2]/20">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-[#B8962C] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#2D5016] mb-2">No Uploads Yet</h3>
                <p className="text-gray-600 mb-4">
                  You haven't uploaded any theses yet. Start by submitting your first thesis.
                </p>
                <Button
                  onClick={() => setActiveTab("upload")}
                  className="bg-[#2D5016] hover:bg-[#4A7C2D] text-white"
                >
                  <FilePlus className="w-4 h-4 mr-2" />
                  Upload Thesis
                </Button>
              </CardContent>
            </Card>
          )}

          {!loadingTheses && !thesesError && myTheses.length > 0 && filteredMyTheses.length === 0 && (
            <Card className="border-[#D4AF37]/30 bg-[#F4E5C2]/20">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-[#B8962C] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#2D5016] mb-2">No Matching Uploads</h3>
                <p className="text-gray-600">
                  No uploads found for the selected status filter.
                </p>
              </CardContent>
            </Card>
          )}

          {!loadingTheses && !thesesError && filteredMyTheses.length > 0 && (
            <div className="space-y-4">
              {filteredMyTheses.map(thesis => (
                <Card
                  key={thesis.id}
                  className={thesis.status === "rejected" ? "border-red-200 bg-red-50/40" : "border-[#2D5016]/10"}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`text-lg font-semibold ${thesis.status === "rejected" ? "text-red-700" : "text-[#2D5016]"}`}>
                            {thesis.title}
                          </h3>
                          <StatusBadge status={thesis.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-4 h-4" />
                            {thesis.department}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {thesis.year}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            Uploaded: {new Date(thesis.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openThesisUploadView(thesis.id)}
                        className={
                          thesis.status === "rejected"
                            ? "border-red-300 text-red-700 hover:bg-red-100"
                            : "border-[#2D5016]/30 text-[#2D5016] hover:bg-[#E8F5E1]"
                        }
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
