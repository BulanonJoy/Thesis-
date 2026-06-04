import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  BookOpen,
  User,
  Calendar,
  Maximize2,
  Minimize2,
  AlertCircle,
  Tag,
  Loader2,
  FileText,
  Building,
  Copy,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { getThesisById, getThesisPDFByIdAsync } from "../../lib/mock-data";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Thesis {
  id: string;
  title: string;
  authors: string;
  mainAuthorName?: string | null;
  coAuthorName?: string | null;
  department: string;
  year: number;
  abstract: string;
  keywords: string[];
  created_at: string;
  updated_at: string;
  status: "pending" | "approved" | "rejected";
  pdf_url: string | null;
  rejection_reason?: string | null;
  mainAuthorEmail?: string | null;
  coAuthorEmail?: string | null;
  apaCitation?: string | null;
  ieeeCitation?: string | null;
  acsCitation?: string | null;
  doi?: string | null;
  research_type?: string | null;
}

function fmt(dateStr: string | undefined | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function statusLabel(s: string) {
  if (s === "approved") return "Approved";
  if (s === "rejected") return "Rejected";
  return "Pending Review";
}

export function ThesisViewerPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [thesis, setThesis]         = useState<Thesis | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [pdfUrl, setPdfUrl]         = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError]     = useState("");
  const [expanded, setExpanded]     = useState(false);
  const [pdfSource, setPdfSource] = useState<string | Uint8Array | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pdfContainer, setPdfContainer] = useState<HTMLDivElement | null>(null);
  const [pdfWidth, setPdfWidth] = useState(860);
  const authorNames = thesis?.authors.split(",").map((name) => name.trim()).filter(Boolean) ?? [];
  const authorList = authorNames.join(", ");
  const shouldShowAuthorInfo = Boolean(thesis?.pdf_url);
  const handleViewerContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  const handleViewerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const key = event.key.toLowerCase();
    const hasModifier = event.ctrlKey || event.metaKey;
    const blockedCombo = hasModifier && (key === "s" || key === "p" || key === "u");
    const blockedShiftCombo = hasModifier && event.shiftKey && (key === "s" || key === "p");
    if (blockedCombo || blockedShiftCombo) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // ── Fetch thesis metadata ────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !user?.id) return;
    setLoading(true);
    
    getThesisById(id)
      .then((data) => {
        if (!data) {
          setError("Thesis not found.");
        } else {
          const mapped: Thesis = {
            id: data.id,
            title: data.title,
            authors: data.authors,
            mainAuthorName: data.mainAuthorName ?? null,
            coAuthorName: data.coAuthorName ?? null,
            department: data.department,
            year: data.year,
            abstract: data.abstract,
            keywords: data.keywords,
            created_at: data.created_at,
            updated_at: data.updated_at,
            status: data.status,
            pdf_url: data.pdf_url,
            rejection_reason: data.rejection_reason ?? null,
            mainAuthorEmail: data.mainAuthorEmail ?? null,
            coAuthorEmail: data.coAuthorEmail ?? null,
            apaCitation: data.apaCitation ?? null,
            ieeeCitation: data.ieeeCitation ?? null,
            acsCitation: data.acsCitation ?? null,
            doi: data.doi ?? null,
            research_type: data.research_type ?? null,
          };
          setThesis(mapped);
        }
      })
      .catch(() => setError("Error loading thesis."))
      .finally(() => setLoading(false));
  }, [id, user?.id]);

  // ── Load PDF if available ─────────────────────────────────────────────────
  useEffect(() => {
    if (!thesis?.id) return;
    setPdfLoading(true);
    setPdfError("");
    setPdfUrl(null);
    setPdfSource(null);
    setNumPages(0);

    getThesisPDFByIdAsync(thesis.id)
      .then((dataUrl) => {
        if (dataUrl) {
          setPdfUrl(dataUrl);
          if (dataUrl.startsWith("data:application/pdf")) {
            setPdfSource(dataUrl);
            return;
          }

          const raw = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
          const binary = atob(raw);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i += 1) {
            bytes[i] = binary.charCodeAt(i);
          }
          setPdfSource(bytes);
        } else {
          setPdfError("PDF data is empty or unavailable for this thesis.");
        }
      })
      .catch(() => setPdfError("Failed to load PDF."))
      .finally(() => setPdfLoading(false));
  }, [thesis?.id]);

  useEffect(() => {
    if (!pdfContainer) return;
    const updateWidth = () => {
      const next = Math.max(320, Math.floor(pdfContainer.clientWidth - 32));
      setPdfWidth(next);
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(pdfContainer);
    return () => observer.disconnect();
  }, [pdfContainer]);

  const handleCopyCitation = async () => {
    const citation = thesis?.apaCitation?.trim();
    if (!citation) return;

    try {
      await navigator.clipboard.writeText(citation);
      toast.success("Citation copied");
    } catch {
      toast.error("Could not copy citation");
    }
  };
  const apaCitation = thesis?.apaCitation?.trim() ?? "";

  const handleCopyIeeeCitation = async () => {
    const citation = thesis?.ieeeCitation?.trim();
    if (!citation) return;
    try {
      await navigator.clipboard.writeText(citation);
      toast.success("Citation copied");
    } catch {
      toast.error("Could not copy citation");
    }
  };

  const handleCopyAcsCitation = async () => {
    const citation = thesis?.acsCitation?.trim();
    if (!citation) return;
    try {
      await navigator.clipboard.writeText(citation);
      toast.success("Citation copied");
    } catch {
      toast.error("Could not copy citation");
    }
  };

  const handleCopyDoi = async () => {
    const doi = thesis?.doi?.trim();
    if (!doi) return;
    try {
      await navigator.clipboard.writeText(doi);
      toast.success("DOI copied");
    } catch {
      toast.error("Could not copy DOI");
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const hasModifier = event.ctrlKey || event.metaKey;
      const blockedCombo = hasModifier && (key === "s" || key === "p" || key === "u");
      const blockedShiftCombo = hasModifier && event.shiftKey && (key === "s" || key === "p");
      if (blockedCombo || blockedShiftCombo) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-[#2D5016]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading thesis...</span>
        </div>
      </div>
    );
  }

  if (error || !thesis) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="border-red-200 bg-red-50 max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-red-800">
              {error || "Thesis not found"}
            </h2>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/browse")}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={expanded ? "fixed inset-0 z-50 bg-white" : ""}>
      {!expanded && (
        <div className="bg-white border-b border-[#2D5016]/10 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-[#2D5016] hover:bg-[#E8F5E1]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <BookOpen className="w-5 h-5 text-[#4A7C2D]" />
            <span className="text-sm font-medium text-gray-700">Thesis Viewer</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(true)}
            className="border-[#2D5016]/30 text-[#2D5016] hover:bg-[#E8F5E1]"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      )}

      <div className={expanded ? "relative flex h-screen min-w-0 bg-gray-100" : "flex min-w-0 flex-col lg:flex-row"}>
        {expanded && (
          <div className="absolute right-4 top-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(false)}
              className="border-[#D9B44A] bg-white text-[#2D5016] shadow-sm hover:bg-[#FFF8E6]"
            >
              <Minimize2 className="w-4 h-4 mr-2" />
              Exit Fullscreen
            </Button>
          </div>
        )}
        {/* Left: Details */}
        <div className={expanded ? "hidden" : "lg:w-1/3"}>
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-[#2D5016] mb-3">{thesis.title}</h1>
              <Badge
                className={
                  thesis.status === "approved"
                    ? "bg-[#E8F5E1] text-[#2D5016]"
                    : thesis.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-[#F4E5C2] text-[#B8962C]"
                }
              >
                {statusLabel(thesis.status)}
              </Badge>
            </div>

            {/* Metadata */}
            <div className="space-y-3 text-sm">
              {shouldShowAuthorInfo && (
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Authors</p>
                    <p className="text-gray-900">{authorList || "—"}</p>
                    {thesis.mainAuthorEmail && (
                      <p className="text-gray-700 text-xs mt-1">Main: {thesis.mainAuthorEmail}</p>
                    )}
                    {thesis.coAuthorEmail && (
                      <p className="text-gray-700 text-xs">Co-Author: {thesis.coAuthorEmail}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Building className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Department</p>
                  <p className="text-gray-900">{thesis.department}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Year</p>
                  <p className="text-gray-900">{thesis.year}</p>
                </div>
              </div>

              {thesis.research_type && (
                <div className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Research Type</p>
                    <p className="text-gray-900">{thesis.research_type}</p>
                  </div>
                </div>
              )}

              {thesis.doi && (
                <div className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">DOI</p>
                    <div className="flex items-center gap-2">
                      <a href={`https://doi.org/${thesis.doi}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {thesis.doi}
                      </a>
                      <Button type="button" size="icon" variant="outline" onClick={handleCopyDoi} className="h-6 w-6">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Uploaded</p>
                  <p className="text-gray-900">{fmt(thesis.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Abstract */}
            <div>
              <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-2">Abstract</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {thesis.abstract}
              </p>
            </div>

            {thesis.status === "approved" && (
              <div className="space-y-3 rounded-md border border-[#D4AF37]/40 bg-[#F4E5C2]/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs text-gray-500 uppercase tracking-wide">Citations</h3>
                </div>

                {apaCitation && (
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs text-gray-500">APA</h4>
                      <p className="text-sm text-gray-700">{apaCitation}</p>
                    </div>
                    <Button type="button" size="icon" variant="outline" onClick={handleCopyCitation} className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {thesis.ieeeCitation && (
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs text-gray-500">IEEE</h4>
                      <p className="text-sm text-gray-700">{thesis.ieeeCitation}</p>
                    </div>
                    <Button type="button" size="icon" variant="outline" onClick={handleCopyIeeeCitation} className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {thesis.acsCitation && (
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs text-gray-500">ACS</h4>
                      <p className="text-sm text-gray-700">{thesis.acsCitation}</p>
                    </div>
                    <Button type="button" size="icon" variant="outline" onClick={handleCopyAcsCitation} className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {thesis.status === "rejected" && thesis.rejection_reason && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <h3 className="text-xs text-red-700 uppercase tracking-wide mb-1">Rejection Reason</h3>
                <p className="text-sm text-red-800 whitespace-pre-line">{thesis.rejection_reason}</p>
              </div>
            )}

            {/* Keywords */}
            <div>
              <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {thesis.keywords.map((kw, i) => (
                  <Badge key={i} variant="secondary" className="bg-[#E8F5E1] text-[#2D5016] border-[#4A7C2D]/20">
                    <Tag className="w-3 h-3 mr-1" />
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: PDF Viewer */}
        <div
          className={expanded ? "flex-1 min-w-0 bg-gray-100 p-4 pt-18" : "bg-gray-100 lg:w-2/3 lg:flex-1 lg:min-w-0"}
          onContextMenu={handleViewerContextMenu}
          onKeyDown={handleViewerKeyDown}
          tabIndex={0}
        >
          <div className={expanded ? "flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-sm" : "flex min-h-[600px] flex-col overflow-hidden lg:h-[calc(100vh-65px)]"}>
            {pdfLoading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-3 text-[#2D5016]">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span>Loading PDF...</span>
                </div>
              </div>
            )}

            {pdfError && (
              <div className="flex-1 flex items-center justify-center p-6">
                <Card className="border-amber-200 bg-amber-50 max-w-md">
                  <CardContent className="p-8 text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                    <h3 className="text-lg font-semibold text-amber-800">PDF Not Available</h3>
                    <p className="text-sm text-amber-700">{pdfError}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {!pdfLoading && !pdfError && pdfSource && (
              <div
                ref={setPdfContainer}
                className="h-full overflow-auto bg-gray-200 p-4 select-none"
                onContextMenu={(e) => e.preventDefault()}
              >
                <div className="mx-auto flex w-fit flex-col gap-4">
                  <Document
                    file={pdfSource}
                    onLoadSuccess={({ numPages: totalPages }) => setNumPages(totalPages)}
                    onLoadError={() => setPdfError("Failed to render PDF.")}
                    loading={null}
                  >
                    {Array.from({ length: numPages }, (_, index) => (
                      <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        width={pdfWidth}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    ))}
                  </Document>
                </div>
              </div>
            )}

            {!pdfLoading && !pdfError && !pdfUrl && (
              <div className="flex-1 flex items-center justify-center p-6">
                <Card className="border-gray-200 max-w-md">
                  <CardContent className="p-8 text-center space-y-4">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                    <h3 className="text-lg font-semibold text-gray-700">No PDF Uploaded</h3>
                    <p className="text-sm text-gray-600">
                      This thesis does not have an associated PDF document.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
