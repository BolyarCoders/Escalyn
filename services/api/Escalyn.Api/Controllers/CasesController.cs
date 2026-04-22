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
                    // ── Step 1: Initial import ────────────────────────
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

                    List<QuestionDTO> returnedQuestions = new();

                    if (!string.IsNullOrWhiteSpace(initialBody))
                    {
                        using JsonDocument initialJson = JsonDocument.Parse(initialBody);
                        JsonElement root = initialJson.RootElement;

                        string responseType = root.TryGetProperty("type", out JsonElement typeEl)
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

                            // ── Save one QuestionBody with all questions ──
                            Case? caseToUpdate = await repo.GetByIdAsync(caseId);
                            if (caseToUpdate != null)
                            {
                                caseToUpdate.Questions = new List<QuestionBody>
                                {
                                    new QuestionBody
                                    {
                                        CaseId = caseId,
                                        Questions = returnedQuestions.Select(q => new Question
                                        {
                                            QuestionAsStr = q.Question,
                                            Answer = q.Answer
                                        }).ToList()
                                    }
                                };

                                await repo.UpdateAsync(caseToUpdate);
                            }
                        }
                    }

                    // ── Step 3a: Get summary ──────────────────────────
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

            // Flatten questions for clean response
            var questions = existingCase.Questions
                .SelectMany(qb => qb.Questions ?? new List<Question>())
                .Select(q => new
                {
                    id = q.Id,
                    question = q.QuestionAsStr,
                    answer = q.Answer
                })
                .ToList();
     
            return Ok(new
            {
                success = true,
                data = new
                {
                    caseId = existingCase.Id,
                    status = existingCase.Status,
                    summary = existingCase.Summaries.LastOrDefault(),
                    questions
                }
            });
        }

        // ─────────────────────────────────────────────────────────────
        // POST api/cases/{id}/confirm
        // User submits answers → sent to n8n → summary returned
        // ─────────────────────────────────────────────────────────────
        [HttpPost("{id}/confirm")]
        public async Task<IActionResult> ConfirmCase(Guid id, [FromBody] CaseConfirmDTO dto)
        {
            Case? existingCase = await _caseRepository.GetByIdAsync(id);
            if (existingCase == null)
                return NotFound(new { success = false, message = "Case not found." });

            if (existingCase.Status != "awaiting_confirmation")
                return BadRequest(new { success = false, message = "Case is not awaiting confirmation." });

            _ = Task.Run(async () =>
            {
                using var scope = _scopeFactory.CreateScope();
                var repo = scope.ServiceProvider.GetRequiredService<ICaseRepository>();
                using var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(60);

                try
                {
                    // ── Step 1: Send answers to n8n ───────────────────
                    var answersPayload = new
                    {
                        case_id = id,
                        answers = dto.Answers.Select((a, i) => new
                        {
                            id = i + 1,
                            question = a.Question,
                            answer = a.Answer
                        })
                    };

                    var additionalResponse = await SendGetWithBodyAsync(http,
                        $"{N8nBaseUrl}/webhook/additional-info",
                        answersPayload);

                    if (!additionalResponse.IsSuccessStatusCode)
                    {
                        await SetCaseStatus(id, "error_additional_info");
                        return;
                    }

                    // ── Step 2: Get summary ───────────────────────────
                    var summaryResponse = await SendGetWithBodyAsync(http,
                        $"{N8nBaseUrl}/webhook/get-summary",
                        new { case_id = id });

                    if (!summaryResponse.IsSuccessStatusCode)
                    {
                        await SetCaseStatus(id, "error_summary");
                        return;
                    }

                    string summaryText = string.Empty;
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

                    // ── Step 3: Persist summary + update answers ──────
                    Case? c = await repo.GetByIdAsync(id);
                    if (c != null)
                    {
                        // Update answers on existing questions
                        foreach (var questionBody in c.Questions)
                        {
                            foreach (var question in questionBody.Questions ?? new List<Question>())
                            {
                                var match = dto.Answers.FirstOrDefault(a => a.Question == question.QuestionAsStr);
                                if (match != null)
                                    question.Answer = match.Answer;
                            }
                        }

                        c.Summaries.Add(!string.IsNullOrEmpty(summaryText) ? summaryText : "error_summary");
                        c.Status = !string.IsNullOrEmpty(summaryText) ? "awaiting_confirmation" : "error_summary";

                        await repo.UpdateAsync(c);
                    }
                }
                catch (TaskCanceledException)
                {
                    _logger.LogError("Confirm flow timed out for case {CaseId}", id);
                    await SetCaseStatus(id, "error_timeout");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Confirm flow failed for case {CaseId}", id);
                    await SetCaseStatus(id, "error_unknown");
                }
            });

            return Accepted(new { success = true, message = "Answers submitted, processing..." });
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

        // ─────────────────────────────────────────────────────────────
        // GET api/cases/{id}/summary
        // Returns the latest summary for the case
        // ─────────────────────────────────────────────────────────────
        // ─────────────────────────────────────────────────────────────
        // GET api/cases/{id}/summary
        // Fetches summary from n8n, stores it in DB and returns it
        // ─────────────────────────────────────────────────────────────
        [HttpGet("{id}/summary")]
        public async Task<IActionResult> GetSummary(Guid id)
        {
            Case? existingCase = await _caseRepository.GetByIdAsync(id);
            if (existingCase == null)
                return NotFound(new { success = false, errorCode = "CASE_NOT_FOUND", message = "Case not found." });

            // ── Contact n8n to get the summary ────────────────────────
            try
            {
                using var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(60);

                var summaryResponse = await SendGetWithBodyAsync(http,
                    $"{N8nBaseUrl}/webhook/get-summary",
                    new { case_id = id });

                string summaryBody = await summaryResponse.Content.ReadAsStringAsync();

                _logger.LogInformation(
                    "n8n get-summary → Status: {StatusCode}, Body: {Body}",
                    (int)summaryResponse.StatusCode, summaryBody);

                if (!summaryResponse.IsSuccessStatusCode)
                {
                    return StatusCode(StatusCodes.Status502BadGateway, new
                    {
                        success = false,
                        errorCode = "N8N_SUMMARY_FAILED",
                        message = "Failed to reach the automation service."
                    });
                }

                // ── Parse summary from n8n response ───────────────────
                string summaryText = string.Empty;

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

                if (string.IsNullOrEmpty(summaryText))
                {
                    return NotFound(new
                    {
                        success = false,
                        errorCode = "SUMMARY_NOT_FOUND",
                        message = "No summary returned from automation service."
                    });
                }

                // ── Store in DB and set status ─────────────────────────
                existingCase.Summaries.Add(summaryText);
                existingCase.Status = "awaiting_confirmation";
                await _caseRepository.UpdateAsync(existingCase);

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        caseId = existingCase.Id,
                        status = existingCase.Status,
                        summary = summaryText
                    }
                });
            }
            catch (TaskCanceledException)
            {
                _logger.LogError("n8n get-summary timed out for case {CaseId}", id);
                return StatusCode(StatusCodes.Status504GatewayTimeout, new
                {
                    success = false,
                    errorCode = "N8N_TIMEOUT",
                    message = "Automation service timed out."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get summary from n8n for case {CaseId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    errorCode = "SUMMARY_ERROR",
                    message = "An unexpected error occurred."
                });
            }
        }

        // ─────────────────────────────────────────────────────────────
        // POST api/cases/{id}/confirm-summary
        // User confirms or rejects the summary, forwards to n8n and
        // waits for the response
        // ─────────────────────────────────────────────────────────────
        [HttpPost("{id}/confirm-summary")]
        public async Task<IActionResult> ConfirmSummary(Guid id, [FromBody] ConfirmSummaryDTO dto)
        {
            Case? existingCase = await _caseRepository.GetByIdAsync(id);
            if (existingCase == null)
                return NotFound(new { success = false, errorCode = "CASE_NOT_FOUND", message = "Case not found." });

            if (existingCase.Status != "awaiting_confirmation")
                return BadRequest(new
                {
                    success = false,
                    errorCode = "INVALID_STATUS",
                    message = $"Case is not awaiting confirmation. Current status: {existingCase.Status}"
                });

            // ── User rejected the summary ─────────────────────────────
            if (!dto.Confirmed)
            {
                existingCase.Status = "summary_rejected";
                await _caseRepository.UpdateAsync(existingCase);
                return Ok(new { success = true, message = "Summary rejected." });
            }

            // ── User confirmed — forward to n8n and wait ──────────────
            try
            {
                using var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(60);

                var confirmPayload = new
                {
                    case_id = id,
                    user_confirm_summary = true
                };

                var response = await SendGetWithBodyAsync(http,
                    $"{N8nBaseUrl}/webhook/confirm-summary",
                    confirmPayload);

                string body = await response.Content.ReadAsStringAsync();

                _logger.LogInformation(
                    "n8n confirm-summary → Status: {StatusCode}, Body: {Body}",
                    (int)response.StatusCode, body);

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode(StatusCodes.Status502BadGateway, new
                    {
                        success = false,
                        errorCode = "N8N_CONFIRM_FAILED",
                        message = "Failed to reach the automation service."
                    });
                }

                // ── Parse n8n response if it returns anything useful ──
                string? n8nMessage = null;
                if (!string.IsNullOrWhiteSpace(body))
                {
                    try
                    {
                        using JsonDocument json = JsonDocument.Parse(body);
                        JsonElement root = json.RootElement;

                        JsonElement obj = root.ValueKind == JsonValueKind.Array
                            ? root[0]
                            : root;

                        if (obj.TryGetProperty("output", out JsonElement outputEl))
                            n8nMessage = outputEl.GetString();
                        else if (obj.TryGetProperty("message", out JsonElement messageEl))
                            n8nMessage = messageEl.GetString();
                    }
                    catch
                    {
                        // n8n returned non-JSON — not a problem, continue
                    }
                }

                // ── Update case status in DB ──────────────────────────
                existingCase.Status = "confirmed";
                await _caseRepository.UpdateAsync(existingCase);

                return Ok(new
                {
                    success = true,
                    message = "Summary confirmed. Processing started.",
                    data = new
                    {
                        caseId = existingCase.Id,
                        status = existingCase.Status,
                        n8nResponse = n8nMessage
                    }
                });
            }
            catch (TaskCanceledException)
            {
                _logger.LogError("n8n confirm-summary timed out for case {CaseId}", id);
                return StatusCode(StatusCodes.Status504GatewayTimeout, new
                {
                    success = false,
                    errorCode = "N8N_TIMEOUT",
                    message = "Automation service timed out."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to confirm summary in n8n for case {CaseId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    errorCode = "CONFIRM_ERROR",
                    message = "An unexpected error occurred."
                });
            }
        }
    }
}