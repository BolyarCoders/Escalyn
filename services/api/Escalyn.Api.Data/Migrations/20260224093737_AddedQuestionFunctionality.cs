using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Escalyn.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedQuestionFunctionality : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompanyEmail",
                table: "Cases",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LastSummary",
                table: "Cases",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompanyEmail",
                table: "Cases");

            migrationBuilder.DropColumn(
                name: "LastSummary",
                table: "Cases");
        }
    }
}
