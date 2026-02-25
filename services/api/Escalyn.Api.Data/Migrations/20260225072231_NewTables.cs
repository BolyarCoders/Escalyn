using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Escalyn.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class NewTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastSummary",
                table: "Cases");

            migrationBuilder.AddColumn<string[]>(
                name: "Summaries",
                table: "Cases",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);

            migrationBuilder.CreateTable(
                name: "QuestionsBodies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CaseId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionsBodies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionsBodies_Cases_CaseId",
                        column: x => x.CaseId,
                        principalTable: "Cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionAsStr = table.Column<string>(type: "text", nullable: false),
                    Answer = table.Column<string>(type: "text", nullable: false),
                    QuestionsBodyId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Questions_QuestionsBodies_QuestionsBodyId",
                        column: x => x.QuestionsBodyId,
                        principalTable: "QuestionsBodies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Questions_QuestionsBodyId",
                table: "Questions",
                column: "QuestionsBodyId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionsBodies_CaseId",
                table: "QuestionsBodies",
                column: "CaseId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "QuestionsBodies");

            migrationBuilder.DropColumn(
                name: "Summaries",
                table: "Cases");

            migrationBuilder.AddColumn<string>(
                name: "LastSummary",
                table: "Cases",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
