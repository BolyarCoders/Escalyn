using Escalyn.Api.Data.Models;
using Escalyn.Api.Data.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Escalyn.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EscalynController : ControllerBase
    {
        // Пример за инжектиране на DbContext или общ Service
        // private readonly ApplicationDbContext _context;
        // public EscalynController(ApplicationDbContext context) { _context = context; }

        // ==========================================
        // УПРАВЛЕНИЕ НА СЛУЧАИ (CASES)
        // ==========================================

        /// <summary>
        /// Взима детайли за даден случай
        /// </summary>
        [HttpGet("cases/{id:guid}")]
        public async Task<ActionResult<CaseOutDTO>> GetCaseById(Guid id)
        {
            // Примерна логика с модела Case:
            // Case dbCase = await _context.Cases.FindAsync(id);
            // if (dbCase == null) return NotFound();
            // 
            // Връщаме мапнато DTO:
            // return Ok(new CaseOutDTO { 
            //     CaseId = dbCase.Id, 
            //     Description = dbCase.Description,
            //     Company = dbCase.Company,
            //     Subject = dbCase.Subject,
            //     Language = dbCase.Language,
            //     CreatedAt = dbCase.CreatedAt.ToString("O") 
            // });

            return Ok(new CaseOutDTO { CaseId = id, Description = "Примерен случай" });
        }

        /// <summary>
        /// Обновява статуса на случай
        /// </summary>
        [HttpPut("cases/{id:guid}/status")]
        public async Task<IActionResult> UpdateCaseStatus(Guid id, [FromBody] CaseStatusUpdateDTO request)
        {
            if (id != request.CaseId)
                return BadRequest("ID-то от URL-а не съвпада с това в тялото на заявката.");

            // Примерна логика с модела Case:
            // Case dbCase = await _context.Cases.FindAsync(id);
            // dbCase.Status = request.Status;
            // dbCase.CompanyEmail = request.CompanyEmail;
            // dbCase.LastSummary = request.Summary;
            // await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Добавя въпроси към случай чрез модела QuestionsBody
        /// </summary>
        [HttpPost("cases/{id:guid}/questions")]
        public async Task<IActionResult> SubmitQuestions(Guid id, [FromBody] QuestionDTO request)
        {
            if (id.ToString() != request.CaseId)
                return BadRequest("ID-то от URL-а не съвпада с това в модела.");

            // Примерна логика с модела QuestionsBody:
            // var questionsBody = new QuestionsBody 
            // {
            //     Id = Guid.NewGuid(),
            //     CaseId = id,
            //     Questions = request.Questions
            // };
            // _context.QuestionsBodies.Add(questionsBody);
            // await _context.SaveChangesAsync();

            return Ok(new { Message = "Въпросите са запазени успешно." });
        }

        // ==========================================
        // УПРАВЛЕНИЕ НА ПОТРЕБИТЕЛИ (USERS)
        // ==========================================

        /// <summary>
        /// Взима потребител по ID
        /// </summary>
        [HttpGet("users/{id:guid}")]
        public async Task<ActionResult<UserDTO>> GetUserById(Guid id)
        {
            // Примерна логика с модела User:
            // User dbUser = await _context.Users.FindAsync(id);
            // if (dbUser == null) return NotFound();
            // 
            // return Ok(new UserDTO {
            //      Id = dbUser.Id.ToString(),
            //      Email = dbUser.Email,
            //      FirstName = dbUser.FirstName,
            //      // ... и т.н.
            // });

            return Ok(new UserDTO { Id = id.ToString(), FirstName = "Иван", LastName = "Иванов" });
        }

        /// <summary>
        /// Обновява личните данни на потребител
        /// </summary>
        [HttpPut("users/{id:guid}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDTO request)
        {
            // Примерна логика:
            // User dbUser = await _context.Users.FindAsync(id);
            // dbUser.FirstName = request.FirstName ?? dbUser.FirstName;
            // dbUser.Language = request.Language ?? dbUser.Language;
            // dbUser.UpdatedAt = DateTime.UtcNow;
            // await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Сменя ролята на потребител
        /// </summary>
        [HttpPatch("users/{id:guid}/role")]
        public async Task<IActionResult> ChangeUserRole(Guid id, [FromBody] ChangeRoleRequestDTO request)
        {
            // Примерна логика:
            // User dbUser = await _context.Users.FindAsync(id);
            // dbUser.Role = request.NewRole;
            // dbUser.UpdatedAt = DateTime.UtcNow;
            // await _context.SaveChangesAsync();

            return Ok(new { Message = $"Ролята е успешно променена на {request.NewRole}" });
        }
    }
}