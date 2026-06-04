using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using ThesisRepository.Data;
using ThesisRepository.DTOs;
using ThesisRepository.Models;

namespace ThesisRepository.Services
{
    public class ThesisService : IThesisService
    {
        private readonly ApplicationDbContext _context;

        public ThesisService(ApplicationDbContext context)
        {
            _context = context;
        }

        // ── Read ─────────────────────────────────────────────────────────────────

        public async Task<List<ThesisDto>> GetAllTheses()
        {
            var theses = await _context.Theses
                .Where(t => !t.IsDeleted)
                .OrderByDescending(t => t.UploadedAt)
                .ToListAsync();

            // Return all theses regardless of PDF availability
            // PDF missing will be handled at download endpoint
            return theses.Select(MapToDto).ToList();
        }

        public async Task<ThesisDto?> GetThesisById(string id)
        {
            if (!int.TryParse(id, out var intId))
                return null;

            var thesis = await _context.Theses
                .FirstOrDefaultAsync(t => t.ThesisId == intId && !t.IsDeleted);
                
            if (thesis == null)
                return null;

            return MapToDto(thesis);
        }

        public async Task<List<ThesisDto>> SearchTheses(string? query, string? department, string? fieldOfResearch, int? year, string? status = "approved", string? researchType = null)
        {
            var thesesQuery = _context.Theses.Where(t => !t.IsDeleted).AsQueryable();

            if (!string.IsNullOrEmpty(status))
                thesesQuery = thesesQuery.Where(t => t.Status == status);

            if (!string.IsNullOrEmpty(researchType))
                thesesQuery = thesesQuery.Where(t => t.ResearchType == researchType);

            if (!string.IsNullOrEmpty(department))
                thesesQuery = thesesQuery.Where(t => t.Department == department);

            if (!string.IsNullOrEmpty(fieldOfResearch))
                thesesQuery = thesesQuery.Where(t => t.FieldOfResearch == fieldOfResearch);

            if (year.HasValue)
                thesesQuery = thesesQuery.Where(t => t.Year == year.Value);

            if (!string.IsNullOrEmpty(query))
            {
                var lowerQuery = query.ToLower();
                thesesQuery = thesesQuery.Where(t => 
                    t.Title.ToLower().Contains(lowerQuery) || 
                    t.Abstract.ToLower().Contains(lowerQuery) || 
                    t.Keywords.ToLower().Contains(lowerQuery) ||
                    t.Authors.ToLower().Contains(lowerQuery));
            }

            var theses = await thesesQuery
                .OrderByDescending(t => t.UploadedAt)
                .ToListAsync();

            // Return all matching theses regardless of PDF availability
            // PDF missing will be handled at download endpoint
            return theses.Select(MapToDto).ToList();
        }

        // ── Write ────────────────────────────────────────────────────────────────

        public async Task<ThesisDto> CreateThesis(CreateThesisDto request)
        {
            // Parse uploader's UserId string → int
            int? uploadedById = int.TryParse(request.UploadedBy, out var uid) ? uid : (int?)null;

            var thesis = new Thesis
            {
                Title           = request.Title,
                Abstract        = request.Abstract,
                Keywords        = JsonSerializer.Serialize(request.Keywords ?? Array.Empty<string>()),
                Authors         = request.Authors,
                Advisors        = request.Advisors,
                Department      = request.Department,
                FieldOfResearch = request.FieldOfResearch,
                Year            = request.Year,
                FilePath        = request.PdfUrl,   // PdfUrl → FilePath column
                Status          = "pending",
                UploadedBy      = uploadedById,
                UploadedAt      = DateTime.UtcNow,
                MainAuthorEmail = request.MainAuthorEmail,
                CoAuthorEmail   = request.CoAuthorEmail,
                Doi             = request.Doi,
                ResearchType    = request.ResearchType
            };

            _context.Theses.Add(thesis);
            await _context.SaveChangesAsync();

            return MapToDto(thesis);
        }

        public async Task<ThesisDto> UpdateThesis(string id, UpdateThesisDto request)
        {
            if (!int.TryParse(id, out var intId))
                throw new Exception("Invalid thesis ID.");

            var thesis = await _context.Theses.FindAsync(intId)
                         ?? throw new Exception("Thesis not found.");

            if (!string.IsNullOrEmpty(request.Title))
                thesis.Title = request.Title;

            if (!string.IsNullOrEmpty(request.Abstract))
                thesis.Abstract = request.Abstract;

            if (request.Keywords != null && request.Keywords.Length > 0)
                thesis.Keywords = JsonSerializer.Serialize(request.Keywords);

            if (!string.IsNullOrEmpty(request.Authors))
                thesis.Authors = request.Authors;

            if (request.Advisors != null)
                thesis.Advisors = request.Advisors;

            if (!string.IsNullOrEmpty(request.Department))
                thesis.Department = request.Department;

            if (!string.IsNullOrEmpty(request.FieldOfResearch))
                thesis.FieldOfResearch = request.FieldOfResearch;

            if (request.Year.HasValue)
                thesis.Year = request.Year.Value;

            if (!string.IsNullOrEmpty(request.MainAuthorEmail))
                thesis.MainAuthorEmail = request.MainAuthorEmail;

            if (request.CoAuthorEmail != null)
                thesis.CoAuthorEmail = request.CoAuthorEmail;

            if (!string.IsNullOrEmpty(request.Doi))
                thesis.Doi = request.Doi;

            if (!string.IsNullOrEmpty(request.ResearchType))
                thesis.ResearchType = request.ResearchType;

            if (!string.IsNullOrEmpty(request.Status))
            {
                var prevStatus = thesis.Status;
                thesis.Status = request.Status;

                // Set ApprovedAt and generate APA citation when transitioning to approved
                if (request.Status == "approved" && prevStatus != "approved")
                {
                    thesis.ApprovedAt = DateTime.UtcNow;
                    thesis.ApaCitation = GenerateApaCitation(thesis);
                    thesis.IeeeCitation = GenerateIeeeCitation(thesis);
                    thesis.AcsCitation = GenerateAcsCitation(thesis);
                }
                
                // Track when it was rejected
                if (request.Status == "rejected" && prevStatus != "rejected")
                {
                    thesis.RejectedAt = DateTime.UtcNow;
                }
            }

            if (!string.IsNullOrEmpty(request.ApprovedBy) &&
                int.TryParse(request.ApprovedBy, out var approverId))
            {
                thesis.ApprovedBy = approverId;
            }

            if (request.RejectionReason != null)
                thesis.RejectionReason = request.RejectionReason;

            await _context.SaveChangesAsync();
            return MapToDto(thesis);
        }

        public async Task DeleteThesis(string id)
        {
            if (!int.TryParse(id, out var intId))
                throw new Exception("Invalid thesis ID.");

            var thesis = await _context.Theses.FindAsync(intId)
                         ?? throw new Exception("Thesis not found.");

            // Soft delete instead of hard delete
            thesis.IsDeleted = true;
            await _context.SaveChangesAsync();
        }

        public async Task IncrementViewCount(string id)
        {
            if (!int.TryParse(id, out var intId))
                throw new Exception("Invalid thesis ID.");

            var thesis = await _context.Theses.FindAsync(intId)
                         ?? throw new Exception("Thesis not found.");

            thesis.ViewCount += 1;
            await _context.SaveChangesAsync();
        }

        // ── PDF Handling ─────────────────────────────────────────────────────────

        public async Task<string> UploadPdf(string fileData)
        {
            // Create the uploads directory alongside the running executable
            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
            Directory.CreateDirectory(uploadsDir);

            var fileName = $"thesis_{DateTime.UtcNow.Ticks}.pdf";
            var filePath = Path.Combine(uploadsDir, fileName);

            // Strip the data-URL prefix when present (e.g. "data:application/pdf;base64,...")
            var base64Data = fileData;
            var commaIndex = fileData.IndexOf(',');
            if (commaIndex >= 0)
                base64Data = fileData[(commaIndex + 1)..];

            var bytes = Convert.FromBase64String(base64Data);
            await File.WriteAllBytesAsync(filePath, bytes);

            // Return the relative path stored in the FilePath column
            return $"uploads/{fileName}";
        }

        public async Task<string?> GetPdfData(string fileId)
        {
            // fileId is the relative path stored in FilePath (e.g. "uploads/thesis_XXXXX.pdf")
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), fileId);
            if (!File.Exists(filePath))
                return null;

            var bytes = await File.ReadAllBytesAsync(filePath);
            // Return a data-URL so the frontend iframe can render it directly
            return $"data:application/pdf;base64,{Convert.ToBase64String(bytes)}";
        }

        // ── Mapping ──────────────────────────────────────────────────────────────

        private static string GenerateApaCitation(Thesis thesis)
        {
            // APA Format: LastName, F., & LastName, F. (Year). Title.
            var authorsRaw = thesis.Authors ?? "Unknown Author";
            var year = thesis.Year > 0 ? thesis.Year.ToString() : DateTime.UtcNow.Year.ToString();
            var title = thesis.Title ?? "Untitled";

            var formattedAuthors = FormatApaAuthors(authorsRaw);

            return $"{formattedAuthors}. ({year}). {title}.";
        }

        private static string GenerateIeeeCitation(Thesis thesis)
        {
            // IEEE Format: A. B. Author1 and C. D. Author2, "Title," Department, Year.
            var authorsRaw = thesis.Authors ?? "Unknown Author";
            var year = thesis.Year > 0 ? thesis.Year.ToString() : DateTime.UtcNow.Year.ToString();
            var title = thesis.Title ?? "Untitled";
            var department = thesis.Department ?? "Unknown Department";

            var formattedAuthors = FormatIeeeAuthors(authorsRaw);
            return $"{formattedAuthors}, \"{title},\" {department}, {year}.";
        }

        private static string GenerateAcsCitation(Thesis thesis)
        {
            // ACS Format: LastName, F.; LastName, F. Title. Department. Year.
            var authorsRaw = thesis.Authors ?? "Unknown Author";
            var year = thesis.Year > 0 ? thesis.Year.ToString() : DateTime.UtcNow.Year.ToString();
            var title = thesis.Title ?? "Untitled";
            var department = thesis.Department ?? "Unknown Department";

            var formattedAuthors = FormatAcsAuthors(authorsRaw);
            return $"{formattedAuthors} {title}. {department}. {year}.";
        }

        private static string FormatApaAuthors(string authorsRaw)
        {
            var authors = authorsRaw
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(a => a.Trim())
                .Where(a => !string.IsNullOrWhiteSpace(a))
                .ToList();

            if (authors.Count == 0)
                return "Unknown Author";

            var formatted = authors.Select(FormatApaAuthorName).ToList();

            if (formatted.Count == 1)
                return formatted[0];

            if (formatted.Count == 2)
                return $"{formatted[0]}, & {formatted[1]}";

            return $"{string.Join(", ", formatted.Take(formatted.Count - 1))}, & {formatted.Last()}";
        }

        private static string FormatApaAuthorName(string author)
        {
            var parts = author.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 0)
                return "Unknown Author";

            var lastName = parts[^1];
            var initials = parts
                .Take(parts.Length - 1)
                .Select(p => char.ToUpperInvariant(p[0]) + ".")
                .ToArray();

            if (initials.Length == 0)
                return lastName;

            return $"{lastName}, {string.Join(" ", initials)}";
        }

        private static string FormatIeeeAuthors(string authorsRaw)
        {
            var authors = authorsRaw
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(a => a.Trim())
                .Where(a => !string.IsNullOrWhiteSpace(a))
                .ToList();

            if (authors.Count == 0)
                return "Unknown Author";

            var formatted = authors.Select(author =>
            {
                var parts = author.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 0)
                    return "Unknown Author";

                var lastName = parts[^1];
                var initials = parts
                    .Take(parts.Length - 1)
                    .Select(p => char.ToUpperInvariant(p[0]) + ".")
                    .ToArray();

                return initials.Length > 0 ? $"{string.Join(" ", initials)} {lastName}" : lastName;
            }).ToList();

            if (formatted.Count == 1)
                return formatted[0];

            if (formatted.Count == 2)
                return $"{formatted[0]} and {formatted[1]}";

            return $"{string.Join(", ", formatted.Take(formatted.Count - 1))}, and {formatted.Last()}";
        }

        private static string FormatAcsAuthors(string authorsRaw)
        {
            var authors = authorsRaw
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(a => a.Trim())
                .Where(a => !string.IsNullOrWhiteSpace(a))
                .ToList();

            if (authors.Count == 0)
                return "Unknown Author";

            var formatted = authors.Select(author =>
            {
                var parts = author.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 0)
                    return "Unknown Author";

                var lastName = parts[^1];
                var initials = parts
                    .Take(parts.Length - 1)
                    .Select(p => char.ToUpperInvariant(p[0]) + ".")
                    .ToArray();

                return initials.Length > 0 ? $"{lastName}, {string.Join("", initials).Replace(".", ". ").Trim()}" : lastName;
            }).ToList();

            return string.Join("; ", formatted);
        }

        private static ThesisDto MapToDto(Thesis t)
        {
            string[] keywords;
            try
            {
                keywords = JsonSerializer.Deserialize<string[]>(t.Keywords)
                           ?? Array.Empty<string>();
            }
            catch
            {
                // Fall back: treat as comma-separated plain text
                keywords = t.Keywords.Split(',', StringSplitOptions.RemoveEmptyEntries);
            }

            var updatedAt = t.ApprovedAt ?? t.UploadedAt;

            return new ThesisDto
            {
                Id              = t.ThesisId.ToString(),
                Title           = t.Title,
                Abstract        = t.Abstract,
                Keywords        = keywords,
                Authors         = t.Authors,
                Advisors        = t.Advisors,
                Department      = t.Department,
                FieldOfResearch = t.FieldOfResearch,
                Year            = t.Year,
                PdfUrl          = t.FilePath,          // FilePath → PdfUrl for frontend
                Status          = t.Status,
                UploadedBy      = t.UploadedBy?.ToString(),
                ApprovedBy      = t.ApprovedBy?.ToString(),
                CreatedAt       = t.UploadedAt,        // UploadedAt → CreatedAt for frontend
                UpdatedAt       = updatedAt,
                ApprovedAt      = t.ApprovedAt,
                RejectionReason = t.RejectionReason,
                ViewCount       = t.ViewCount,
                DownloadCount   = t.DownloadCount,
                ApaCitation     = t.ApaCitation,
                IeeeCitation    = t.IeeeCitation,
                AcsCitation     = t.AcsCitation,
                Doi             = t.Doi,
                MainAuthorEmail = t.MainAuthorEmail,
                CoAuthorEmail   = t.CoAuthorEmail,
                ResearchType    = t.ResearchType
            };
        }

        private static bool IsPdfAvailable(Thesis thesis)
        {
            if (string.IsNullOrWhiteSpace(thesis.FilePath))
                return false;

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), thesis.FilePath);
            return File.Exists(filePath);
        }
    }
}
