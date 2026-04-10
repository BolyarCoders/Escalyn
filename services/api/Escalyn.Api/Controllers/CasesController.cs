using Escalyn.Api.Data.Models;
using Escalyn.Api.Data.Models.DTOs;
using Escalyn.Api.Data.Repositories.IRepositories;
using Microsoft.AspNetCore.Mvc;
using System.Text;
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
        private readonly IServiceScopeFactory _scopeFactory;

        private const string N8nBaseUrl = "https://n8n-production-8af3.up.railway.app";

        public CasesController(
            ICaseRepository caseRepository,
            IHttpClientFactory httpClientFactory,
            ILogger<CasesController> logger,
            IServiceScopeFactory scopeFactory)
        {
            _caseRepository = caseRepository;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _scopeFactory = scopeFactory;
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

            // Capture primitives — avoid closing over EF entity after request ends
            var caseId = result.Id;
            var subject = result.Subject;
            var language = result.Language;
            var description = result.Description;
            var company = result.Company;
            var createdAt = result.CreatedAt;
            var answers = dto.Answers;

            // ── Fire and forget — n8n runs in background ──────────────
            _ = Task.Run(async () =>
            {
                using var scope = _scopeFactory.CreateScope();
                var repo = scope.ServiceProvider.GetRequiredService<ICaseRepository>();
                using var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(60);

                try
                {
                    // ── Step 1: Initial import (GET + JSON body) ──────
                    var initialPayload = new
                    {
                        case_id = caseId,
                        subject = subject,
                        language = language,
                        message = description,
                        company = company,
                        date = createdAt.ToString("yyyy-MM-dd")
                    };

                    var initialResponse = await SendGetWithBodyAsync(http,
                        $"{N8nBaseUrl}/webhook/inital-import",
                        initialPayload);

                    string initialBody = await initialResponse.Content.ReadAsStringAsync();
                    _logger.LogInformation(
                        "n8n initial-import → Status: {StatusCode}, Body: {Body}",
                        (int)initialResponse.StatusCode,
                        initialBody);

                    if (!initialResponse.IsSuccessStatusCode)
                    {
                        await SetCaseStatus(caseId, "error_initial_import");
                        return;
                    }

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
                                        Answer = answers != null && idx < answers.Count
                                            ? answers[idx]
                                            : string.Empty
                                    });
                                    idx++;
                                }
                            }

                            var answersPayload = new
                            {
                                case_id = caseId,
                                answers = returnedQuestions.Select((q, i) => new
                                {
                                    id = i + 1,
                                    question = q.Question,
                                    answer = q.Answer
                                })
                            };

                            var additionalResponse = await SendGetWithBodyAsync(http,
                                $"{N8nBaseUrl}/webhook/additional-info",
                                answersPayload);

                            _logger.LogInformation(
                                "n8n additional-info → Status: {StatusCode}",
                                (int)additionalResponse.StatusCode);

                            if (!additionalResponse.IsSuccessStatusCode)
                            {
                                await SetCaseStatus(caseId, "error_additional_info");
                                return;
                            }
                        }
                    }

                    // ── Step 3a: Get summary (GET + JSON body) ────────
                    string summaryText = string.Empty;

                    var summaryResponse = await SendGetWithBodyAsync(http,
                        $"{N8nBaseUrl}/webhook/get-summary",
                        new { case_id = caseId });

                    _logger.LogInformation(
                        "n8n get-summary → Status: {StatusCode}",
                        (int)summaryResponse.StatusCode);

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

                    // ── Step 3b: Store summary, await user confirmation ──
                    if (!string.IsNullOrEmpty(summaryText))
                    {
                        Case? c = await repo.GetByIdAsync(caseId);
                        if (c != null)
                        {
                            c.Summaries.Add(summaryText);
                            c.Status = "awaiting_confirmation";
                            await repo.UpdateAsync(c);
                        }
                    }
                    else
                    {
                        await SetCaseStatus(caseId, "error_summary");
                    }
                }
                catch (TaskCanceledException)
                {
                    _logger.LogError("n8n flow timed out for case {CaseId}", caseId);
                    await SetCaseStatus(caseId, "error_timeout");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Background n8n flow failed for case {CaseId}", caseId);
                    await SetCaseStatus(caseId, "error_unknown");
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
        // Helper: GET request with JSON body
        // n8n webhook nodes are configured as GET but read from the body
        // ─────────────────────────────────────────────────────────────
        private static async Task<HttpResponseMessage> SendGetWithBodyAsync(HttpClient http, string url, object payload)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, url)
            {
                Content = new StringContent(
                    JsonSerializer.Serialize(payload),
                    Encoding.UTF8,
                    "application/json")
            };
            return await http.SendAsync(request);
        }

        // ─────────────────────────────────────────────────────────────
        // Helper: safely update case status from background threads
        // Always creates its own scope — safe to call from Task.Run
        // ─────────────────────────────────────────────────────────────
        private async Task SetCaseStatus(Guid caseId, string status)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var repo = scope.ServiceProvider.GetRequiredService<ICaseRepository>();

                Case? c = await repo.GetByIdAsync(caseId);
                if (c != null)
                {
                    c.Status = status;
                    await repo.UpdateAsync(c);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update status for case {CaseId} to {Status}", caseId, status);
            }
        }
    }
}