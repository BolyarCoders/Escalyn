using Escalyn.Api.Data.Models;
using Escalyn.Api.Data.Models.DTOs;
using Escalyn.Api.Data.Repositories;
using Escalyn.Api.Data.Repositories.IRepositories;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Escalyn.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CasesController : ControllerBase
    {
        private readonly ICaseRepository _caseRepository;
        private readonly IHttpClientFactory _httpClientFactory;

        private const string N8nBaseUrl = "https://n8n-production-8af3.up.railway.app";

        public CasesController(ICaseRepository caseRepository, IHttpClientFactory httpClientFactory)
        {
            _caseRepository = caseRepository;
            _httpClientFactory = httpClientFactory;
        }

        // ─────────────────────────────────────────────────────────────
        // POST api/cases
        // Full flow (all n8n calls are GET per API docs):
        //   1. Persist the case in DB
        //   2. GET /webhook/inital-import   → may return clarifying questions
        //   3. GET /webhook/additional-info → submit answers if questions returned
        //   4. GET /webhook/get-summary     → AI summary text
        //   5. GET /webhook/confirm-summary → confirm summary
        // ─────────────────────────────────────────────────────────────
        [HttpPost]
        [ProducesResponseType(typeof(CaseOutDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        public async Task<IActionResult> CreateCase([FromBody] CaseCreateDTO dto)
        {
            // ── Step 0: Persist case ──────────────────────────────────
            Case toAdd = new Case()
            {
                UserId = dto.UserId,
                Description = dto.Description,
                Company = dto.Company,
                CompanyEmail = dto.CompanyEmail,
                Subject = dto.Subject,
                Language = dto.Language,
                Status = dto.Status,
                Summaries = new List<string>(),
                Questions = new List<QuestionBody>()
            };

            Case result = await _caseRepository.CreateAsync(toAdd);
            var http = _httpClientFactory.CreateClient();
            List<QuestionDTO> returnedQuestions = new();

            // ── Step 1: Initial import (GET) ──────────────────────────
            string initialUrl = $"{N8nBaseUrl}/webhook/inital-import" +
                $"?case_id={result.Id}" +
                $"&subject={Uri.EscapeDataString(result.Subject)}" +
                $"&language={Uri.EscapeDataString(result.Language)}" +
                $"&message={Uri.EscapeDataString(result.Description)}" +
                $"&company={Uri.EscapeDataString(result.Company)}" +
                $"&date={result.CreatedAt:yyyy-MM-dd}";

            HttpResponseMessage initialResponse = await http.GetAsync(initialUrl);

            if (!initialResponse.IsSuccessStatusCode)
            {
                return StatusCode(StatusCodes.Status502BadGateway, new
                {
                    success = false,
                    errorCode = "N8N_INITIAL_IMPORT_FAILED",
                    message = "Failed to reach the automation service (initial-import)."
                });
            }

            // Guard: n8n may return 200 with an empty body
            string initialBody = await initialResponse.Content.ReadAsStringAsync();
            if (!string.IsNullOrWhiteSpace(initialBody))
            {
                using JsonDocument initialJson = JsonDocument.Parse(initialBody);
                JsonElement root = initialJson.RootElement;
                string responseType = root.TryGetProperty("type", out JsonElement typeEl)
                    ? typeEl.GetString() ?? "success"
                    : "success";

                // ── Step 2: Additional info (GET) — only if AI returned questions
                if (responseType != "success")
                {
                    if (root.TryGetProperty("data", out JsonElement dataEl) && dataEl.ValueKind == JsonValueKind.Array)
                    {
                        int idx = 0;
                        foreach (JsonElement q in dataEl.EnumerateArray())
                        {
                            returnedQuestions.Add(new QuestionDTO
                            {
                                Question = q.GetString() ?? $"Question {idx + 1}",
                                Answer = dto.Answers != null && idx < dto.Answers.Count
                                               ? dto.Answers[idx]
                                               : string.Empty
                            });
                            idx++;
                        }
                    }

                    string answersJson = Uri.EscapeDataString(JsonSerializer.Serialize(
                        returnedQuestions.Select((q, i) => new
                        {
                            id = i + 1,
                            question = q.Question,
                            answer = q.Answer
                        })
                    ));

                    string additionalUrl = $"{N8nBaseUrl}/webhook/additional-info" +
                        $"?case_id={result.Id}" +
                        $"&answers={answersJson}";

                    HttpResponseMessage additionalResponse = await http.GetAsync(additionalUrl);

                    if (!additionalResponse.IsSuccessStatusCode)
                    {
                        return StatusCode(StatusCodes.Status502BadGateway, new
                        {
                            success = false,
                            errorCode = "N8N_ADDITIONAL_INFO_FAILED",
                            message = "Failed to reach the automation service (additional-info)."
                        });
                    }
                }
            }

            // ── Step 3a: Get summary (GET) ────────────────────────────
            string summaryText = string.Empty;
            HttpResponseMessage summaryResponse = await http.GetAsync(
                $"{N8nBaseUrl}/webhook/get-summary?caseId={result.Id}");

            if (summaryResponse.IsSuccessStatusCode)
            {
                string summaryBody = await summaryResponse.Content.ReadAsStringAsync();
                if (!string.IsNullOrWhiteSpace(summaryBody))
                {
                    using JsonDocument summaryJson = JsonDocument.Parse(summaryBody);
                    if (summaryJson.RootElement.TryGetProperty("output", out JsonElement outputEl))
                        summaryText = outputEl.GetString() ?? string.Empty;
                }
            }
            // Gracefully continue even if summary unavailable (step 3 is partially working per docs)

            // ── Step 3b: Confirm summary (GET) ────────────────────────
            if (!string.IsNullOrEmpty(summaryText))
            {
                string confirmUrl = $"{N8nBaseUrl}/webhook/confirm-summary" +
                    $"?case_id={result.Id}" +
                    $"&user_confirm_summary=true";

                await http.GetAsync(confirmUrl);

                result.Summaries.Add(summaryText);
                await _caseRepository.UpdateAsync(result);
            }

            // ── Respond ───────────────────────────────────────────────
            var outDto = new CaseOutDTO
            {
                CaseId = result.Id,
                Description = result.Description,
                Company = result.Company,
                Subject = result.Subject,
                Language = result.Language,
                CreatedAt = result.CreatedAt.ToString("O")
            };

            return CreatedAtAction(nameof(GetCaseById), new { id = result.Id }, new
            {
                success = true,
                data = outDto,
                questions = returnedQuestions.Count > 0 ? returnedQuestions : null,
                summary = string.IsNullOrEmpty(summaryText) ? null : summaryText
            });
        }

        // ─────────────────────────────────────────────────────────────
        // GET api/cases/cases/{id}
        // ─────────────────────────────────────────────────────────────
        [HttpGet("cases/{id}")]
        public async Task<ActionResult<CaseOutDTO>> GetCaseById(string id)
        {
            try
            {
                if (!Guid.TryParse(id, out Guid caseId))
                    return Forbid();

                Case? caseFromDb = await _caseRepository.GetByIdAsync(caseId);
                if (caseFromDb == null)
                    return NotFound(new { success = false, errorCode = "CASE_NOT_FOUND", message = "Case not found." });

                return Ok(new CaseOutDTO
                {
                    CaseId = caseFromDb.Id,
                    Description = caseFromDb.Description,
                    Company = caseFromDb.Company,
                    Subject = caseFromDb.Subject,
                    Language = caseFromDb.Language,
                    CreatedAt = caseFromDb.CreatedAt.ToString("O")
                });
            }
            catch
            {
                return Forbid();
            }
        }

        // ─────────────────────────────────────────────────────────────
        // PUT api/cases/cases/{id}/status
        // ─────────────────────────────────────────────────────────────
        [HttpPut("cases/{id}/status")]
        public async Task<IActionResult> UpdateCaseStatus(string id, [FromBody] CaseStatusUpdateDTO request)
        {
            try
            {
                if (!Guid.TryParse(id, out Guid caseId))
                    return Forbid();

                Case? caseFromDb = await _caseRepository.GetByIdAsync(caseId);
                if (caseFromDb == null)
                    return NotFound(new { success = false, errorCode = "CASE_NOT_FOUND", message = "Case not found." });

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

        // ─────────────────────────────────────────────────────────────
        // DELETE api/cases/{id}
        // ─────────────────────────────────────────────────────────────
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCase(string id)
        {
            try
            {
                if (!Guid.TryParse(id, out Guid caseId))
                    return Forbid();

                Case? caseFromDb = await _caseRepository.GetByIdAsync(caseId);
                if (caseFromDb == null)
                    return NotFound(new { success = false, errorCode = "CASE_NOT_FOUND", message = "Case not found." });

                await _caseRepository.DeleteAsync(caseId);
                return NoContent();
            }
            catch
            {
                return Forbid();
            }
        }

        // ─────────────────────────────────────────────────────────────
        // GET api/cases/user/{userId}/cases
        // ─────────────────────────────────────────────────────────────
        [HttpGet("user/{userId}/cases")]
        public async Task<IActionResult> GetCasesByUserId(string userId)
        {
            if (!Guid.TryParse(userId, out Guid userGuid))
                return BadRequest(new { success = false, errorCode = "INVALID_GUID", message = "Invalid user ID format." });

            var cases = await _caseRepository.GetByUserIdAsync(userGuid);

            var caseDtos = cases.Select(c => new CaseOutDTO
            {
                CaseId = c.Id,
                Description = c.Description,
                Company = c.Company,
                Subject = c.Subject,
                Language = c.Language,
                CreatedAt = c.CreatedAt.ToString("O")
            }).ToList();

            return Ok(new { success = true, data = caseDtos });
        }
    }
}