using Escalyn.Api.Data.Models;
using Escalyn.Api.Data.Models.DTOs;
using Escalyn.Api.Data.Repositories;
using Escalyn.Api.Data.Repositories.IRepositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Escalyn.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CasesController : ControllerBase
    {
        private readonly ICaseRepository _caseRepository;
        public CasesController(ICaseRepository caseRepository)
        {
            _caseRepository = caseRepository;
        }

        [HttpGet("cases/{id}")]
        public async Task<ActionResult<CaseOutDTO>> GetCaseById(string id)
        {

            try
            {
                bool isValidGuid = Guid.TryParse(id, out Guid caseId);
                if (!isValidGuid)
                {
                    return Forbid();
                }
                Case? caseFromDb = await _caseRepository.GetByIdAsync(caseId);
                if (caseFromDb == null)
                {
                    return NotFound(new { success = false, errorCode = "CASE_NOT_FOUND", message = "Case not found." });
                }
                CaseOutDTO caseOutDto = new CaseOutDTO
                {
                    CaseId = caseFromDb.Id,
                    Description = caseFromDb.Description,
                    Company = caseFromDb.Company,
                    Subject = caseFromDb.Subject,
                    Language = caseFromDb.Language,
                    CreatedAt = caseFromDb.CreatedAt.ToString("O")
                };
                return Ok(caseOutDto);

            }
            catch
            {
                return Forbid();
            }
        }

        [HttpPut("cases/{id}/status")]
        public async Task<IActionResult> UpdateCaseStatus(string id, [FromBody] CaseStatusUpdateDTO request)
        {
            try
            {
                bool isValidGuid = Guid.TryParse(id, out Guid caseId);
                if (!isValidGuid)
                {
                    return Forbid();
                }
                Case? caseFromDb = await _caseRepository.GetByIdAsync(Guid.Parse(id));
                if (caseFromDb == null)
                {
                    return NotFound(new { success = false, errorCode = "CASE_NOT_FOUND", message = "Case not found." });
                }
                caseFromDb.Status = request.Status;
                caseFromDb.CompanyEmail = request.CompanyEmail;
                caseFromDb.Summaries.Add(request.Summary);
                await _caseRepository.UpdateAsync(caseFromDb);
                return Ok(caseFromDb);
            }
            catch
            {
                return Forbid();
            }

        }

        [HttpPost("cases/create")]
        [Authorize ]
        public async Task<IActionResult> CreateCase([FromBody] Case request)
        {
            try
            {
                Case newCase = new Case
                {
                    Description = request.Description,
                    Company = request.Company,
                    Subject = request.Subject,
                    Language = request.Language,
                    Status = "Open",
                    CreatedAt = DateTime.UtcNow
                };
                await _caseRepository.CreateAsync(newCase);
                return Ok(newCase);
            }
            catch
            {
                return Forbid();
            }

        }

        [HttpPost]
        [ProducesResponseType(typeof(Case), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CreateCase([FromBody] CaseCreateDTO dto)
        {
            //var userExists = await _userRepository.ExistsAsync(dto.UserId);
            //if (!userExists)
            //    return NotFound($"User with ID {dto.UserId} not found.");

            Case toAdd = new Case()
            {
                UserId = dto.UserId,
                Description = dto.Description,
                Company = dto.Company,
                CompanyEmail = dto.CompanyEmail,
                Subject = dto.Subject,
                Language = dto.Language,
                Status = "Open", //testovo
                Summaries = new List<string>(),
                Questions = new List<QuestionBody>()
            };

            var result = await _caseRepository.CreateAsync(toAdd);
            return CreatedAtAction(nameof(GetCaseById), new { id = result.Id }, result);
        }
    }
}