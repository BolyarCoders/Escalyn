using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Escalyn.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedColumnWinRate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WinRate",
                table: "Cases",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WinRate",
                table: "Cases");
        }
    }
}
