using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThesisRepository.Migrations
{
    /// <inheritdoc />
    public partial class AddMultipleEmailsSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "MainAuthorEmail",
                table: "Theses",
                type: "text",
                nullable: true,
                comment: "JSON array of main author email addresses or semicolon-separated emails. Format: [\"email1@example.com\", \"email2@example.com\"] or email1@example.com;email2@example.com",
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true,
                oldComment: "nullable - main author email address");

            migrationBuilder.AlterColumn<string>(
                name: "CoAuthorEmail",
                table: "Theses",
                type: "text",
                nullable: true,
                comment: "JSON array of co-author email addresses or semicolon-separated emails. Format: [\"email1@example.com\", \"email2@example.com\"] or email1@example.com;email2@example.com",
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true,
                oldComment: "nullable - co-author email address");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "MainAuthorEmail",
                table: "Theses",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                comment: "nullable - main author email address",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true,
                oldComment: "JSON array of main author email addresses or semicolon-separated emails. Format: [\"email1@example.com\", \"email2@example.com\"] or email1@example.com;email2@example.com");

            migrationBuilder.AlterColumn<string>(
                name: "CoAuthorEmail",
                table: "Theses",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                comment: "nullable - co-author email address",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true,
                oldComment: "JSON array of co-author email addresses or semicolon-separated emails. Format: [\"email1@example.com\", \"email2@example.com\"] or email1@example.com;email2@example.com");
        }
    }
}
