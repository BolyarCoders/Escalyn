using Escalyn.Api.Data.Models;
using Escalyn.Api.Data.Models.DTOs;
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
        private readonly ILogger<CasesController> _logger;

        private const string N8nBaseUrl = "https://n8n-production-8af3.up.railway.app";

        public CasesController(
            ICaseRepository caseRepository,
            IHttpClientFactory httpClientFactory,
            ILogger<CasesController> logger)
        {
            _caseRepository = caseRepository;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        // ─────────────────────────────────────────────────────────────
        // POST api/cases
        // Returns immediately with caseId. n8n runs in background.
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
                Status = "processing",
                Summaries = new List<string>(),
                Questions = new List<QuestionBody>()
            };

            Case result = await _caseRepository.CreateAsync(toAdd);

            // ── Fire and forget — n8n runs in background ──────────────
            _ = Task.Run(async () =>
            {
                using var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(60);

                try
                {
                    // ── Step 1: Initial import ────────────────────────
                    var initialPayload = new
                    {
                        case_id = result.Id,
                        subject = result.Subject,
                        language = result.Language,
                        message = result.Description,
                        company = result.Company,
                        date = result.CreatedAt.ToString("yyyy-MM-dd")
                    };

                    var initialResponse = await http.PostAsJsonAsync(
                        $"{N8nBaseUrl}/webhook/initial-import",
                        initialPayload
                    );

                    if (!initialResponse.IsSuccessStatusCode)
                    {
                        await SetCaseStatus(result.Id, "error_initial_import");
                        return;
                    }

                    string initialBody = await initialResponse.Content.ReadAsStringAsync();
                    string responseType = "success";
                    List<QuestionDTO> returnedQuestions = new();

                    if (!string.IsNullOrWhiteSpace(initialBody))
                    {
                        using JsonDocument initialJson = JsonDocument.Parse(initialBody);
                        JsonElement root = initialJson.RootElement;

                        responseType = root.TryGetProperty("type", out JsonElement typeEl)
                            ? typeEl.GetString() ?? "success"
                            : "success";

                        // ── Step 2: Additional info if needed ─────────
                        if (responseType != "success")
                        {
                            if (root.TryGetProperty("data", out JsonElement dataEl)
                                && dataEl.ValueKind == JsonValueKind.Array)
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

                            var answersPayload = new
                            {
                                case_id = result.Id,
                                answers = returnedQuestions.Select((q, i) => new
                                {
                                    id = i + 1,
                                    question = q.Question,
                                    answer = q.Answer
                                })
                            };

                            var additionalResponse = await http.PostAsJsonAsync(
                                $"{N8nBaseUrl}/webhook/additional-info",
                                answersPayload
                            );

                            if (!additionalResponse.IsSuccessStatusCode)
                            {
                                await SetCaseStatus(result.Id, "error_additional_info");
                                return;
                            }
                        }
                    }

                    // ── Step 3a: Get summary ──────────────────────────
                    string summaryText = string.Empty;

                    var summaryResponse = await http.PostAsJsonAsync(
                        $"{N8nBaseUrl}/webhook/get-summary",
                        new { case_id = result.Id }
                    );

                    if (summaryResponse.IsSuccessStatusCode)
                    {
                        string summaryBody = await summaryResponse.Content.ReadAsStringAsync();
                        if (!string.IsNullOrWhiteSpace(summaryBody))
                        {
                            using JsonDocument summaryJson = JsonDocument.Parse(summaryBody);
                            JsonElement summaryRoot = summaryJson.RootElement;

                            JsonElement summaryObj = summaryRoot.ValueKind == JsonValueKind.Array
                                ? summaryRoot[0]
                                : summaryRoot;

                            if (summaryObj.TryGetProperty("output", out JsonElement outputEl))
                                summaryText = outputEl.GetString() ?? string.Empty;
                        }
                    }

                    // ── Store summary, wait for user to confirm via separate endpoint ──
                    if (!string.IsNullOrEmpty(summaryText))
                    {
                        result.Summaries.Add(summaryText);
                        result.Status = "awaiting_confirmation";
                        await _caseRepository.UpdateAsync(result);
                    }
                    else
                    {
                        await SetCaseStatus(result.Id, "error_summary");
                    }
                }
                catch (TaskCanceledException)
                {
                    _logger.LogError("n8n flow timed out for case {CaseId}", result.Id);
                    await SetCaseStatus(result.Id, "error_timeout");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Background n8n flow failed for case {CaseId}", result.Id);
                    await SetCaseStatus(result.Id, "error_unknown");
                }
            });

            // ── Return immediately with caseId ────────────────────────
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
                data = outDto
            });
        }

        // ─────────────────────────────────────────────────────────────
        // POST api/cases/{id}/confirm-summary
        // User explicitly confirms the summary — triggers n8n Steps 4+
        // ─────────────────────────────────────────────────────────────
        //[HttpPost("{id}/confirm-summary")]
        //[ProducesResponseType(StatusCodes.Status200OK)]
        //[ProducesResponseType(StatusCodes.Status401Unauthorized)]
        //[ProducesResponseType(StatusCodes.Status404NotFound)]
        //public async Task<IActionResult> ConfirmSummary(Guid id, [FromBody] ConfirmSummaryDTO dto)
        //{
        //    Case? existingCase = await _caseRepository.GetByIdAsync(id);
        //    if (existingCase == null)
        //        return NotFound(new { success = false, message = "Case not found." });

        //    // ── Auth check: verify case belongs to this user ──────────
        //    if (existingCase.UserId != dto.UserId)
        //        return Unauthorized(new { success = false, message = "Unauthorized." });

        //    if (existingCase.Status != "awaiting_confirmation")
        //        return BadRequest(new { success = false, message = "Case is not awaiting confirmation." });

        //    // ── User rejected the summary ─────────────────────────────
        //    if (!dto.Confirmed)
        //    {
        //        existingCase.Status = "summary_rejected";
        //        await _caseRepository.UpdateAsync(existingCase);
        //        return Ok(new { success = true, message = "Summary rejected." });
        //    }

        //    // ── User confirmed — trigger n8n Steps 4+ in background ───
        //    existingCase.Status = "confirmed";
        //    await _caseRepository.UpdateAsync(existingCase);

        //    _ = Task.Run(async () =>
        //    {
        //        using var http = _httpClientFactory.CreateClient();
        //        http.Timeout = TimeSpan.FromSeconds(60);

        //        try
        //        {
        //            await http.PostAsJsonAsync(
        //                $"{N8nBaseUrl}/webhook/confirm-summary",
        //                new
        //                {
        //                    case_id = id,
        //                    user_confirm_summary = true,
        //                    accessToken = dto.AccessToken
        //                }
        //            );
        //        }
        //        catch (Exception ex)
        //        {
        //            _logger.LogError(ex, "Failed to confirm summary in n8n for case {CaseId}", id);
        //            await SetCaseStatus(id, "error_confirmation");
        //        }
        //    });

        //    return Ok(new { success = true, message = "Summary confirmed. Processing started." });
        //}

        // ─────────────────────────────────────────────────────────────
        // GET api/cases/{id}/status
        // Frontend polls this to track background progress
        // ─────────────────────────────────────────────────────────────
        [HttpGet("{id}/status")]
        public async Task<IActionResult> GetCaseStatus(Guid id)
        {
            Case? existingCase = await _caseRepository.GetByIdAsync(id);
            if (existingCase == null)
                return NotFound(new { success = false, message = "Case not found." });

            return Ok(new
            {
                success = true,
                data = new
                {
                    caseId = existingCase.Id,
                    status = existingCase.Status,
                    summary = existingCase.Summaries.LastOrDefault()
                }
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
        // PUT api/cases/cases/status
        // Called by n8n to update case status after Steps 4-6
        // ─────────────────────────────────────────────────────────────
        [HttpPut("cases/status")]
        public async Task<IActionResult> UpdateCaseStatus([FromBody] CaseStatusUpdateDTO request)
        {
            try
            {
                if (!Guid.TryParse(request.CaseId.ToString(), out Guid caseId))
                    return Forbid();

                Case? caseFromDb = await _caseRepository.GetByIdAsync(caseId);
                if (caseFromDb == null)
                    return NotFound(new { success = false, errorCode = "CASE_NOT_FOUND", message = "Case not found." });

                caseFromDb.Status = request.Status;

                if (!string.IsNullOrEmpty(request.CompanyEmail))
                    caseFromDb.CompanyEmail = request.CompanyEmail;

                if (!string.IsNullOrEmpty(request.Summary))
                    caseFromDb.Summaries.Add(request.Summary);

                await _caseRepository.UpdateAsync(caseFromDb);

                return Ok(new { success = true, data = caseFromDb });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update status for case {CaseId}", request.CaseId);
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

        // ─────────────────────────────────────────────────────────────
        // Helper: safely update case status from background threads
        // ─────────────────────────────────────────────────────────────
        private async Task SetCaseStatus(Guid caseId, string status)
        {
            try
            {
                Case? c = await _caseRepository.GetByIdAsync(caseId);
                if (c != null)
                {
                    c.Status = status;
                    await _caseRepository.UpdateAsync(c);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update status for case {CaseId} to {Status}", caseId, status);
            }
        }
    }
}