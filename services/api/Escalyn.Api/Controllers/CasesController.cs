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

        private const string N8nBaseUrl = "https://n8n-production-8af3.up.railway.app";

        public CasesController(ICaseRepository caseRepository, IHttpClientFactory httpClientFactory)
        {
            _caseRepository = caseRepository;
            _httpClientFactory = httpClientFactory;
        }

        // ─────────────────────────────────────────────────────────────
        // POST api/cases
        // n8n webhook trigger is configured as GET but reads the JSON body.
        // We use HttpRequestMessage to send GET + JSON body for all n8n calls.
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

            // ── Step 1: Initial import (GET + JSON body) ──────────────
            var initialPayload = new
            {
                case_id = result.Id,
                subject = result.Subject,
                language = result.Language,
                message = result.Description,
                company = result.Company,
                date = result.CreatedAt.ToString("yyyy-MM-dd")
            };

            HttpResponseMessage initialResponse = await SendGetWithBodyAsync(http, $"{N8nBaseUrl}/webhook/inital-import", initialPayload);

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

                // ── Step 2: Additional info (GET + JSON body) ─────────
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

                    HttpResponseMessage additionalResponse = await SendGetWithBodyAsync(http, $"{N8nBaseUrl}/webhook/additional-info", answersPayload);

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

            // ── Step 3a: Get summary (GET + JSON body) ────────────────
            string summaryText = string.Empty;
            HttpResponseMessage summaryResponse = await SendGetWithBodyAsync(http, $"{N8nBaseUrl}/webhook/get-summary", new
            {
                case_id = result.Id
            });

            if (summaryResponse.IsSuccessStatusCode)
            {
                string summaryBody = await summaryResponse.Content.ReadAsStringAsync();
                if (!string.IsNullOrWhiteSpace(summaryBody))
                {
                    using JsonDocument summaryJson = JsonDocument.Parse(summaryBody);
                    JsonElement summaryRoot = summaryJson.RootElement;

                    // n8n may return an array [ { "output": "..." } ] or an object { "output": "..." }
                    JsonElement summaryObj = summaryRoot.ValueKind == JsonValueKind.Array
                        ? summaryRoot[0]
                        : summaryRoot;

                    if (summaryObj.TryGetProperty("output", out JsonElement outputEl))
                        summaryText = outputEl.GetString() ?? string.Empty;
                }
            }
            // Gracefully continue even if summary unavailable (step 3 is partially working per docs)

            // ── Step 3b: Confirm summary (GET + JSON body) ────────────
            if (!string.IsNullOrEmpty(summaryText))
            {
                await SendGetWithBodyAsync(http, $"{N8nBaseUrl}/webhook/confirm-summary", new
                {
                    case_id = result.Id,
                    user_confirm_summary = true
                });

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

        // ─────────────────────────────────────────────────────────────
        // Helpers
        // ─────────────────────────────────────────────────────────────

        /// <summary>
        /// Sends a GET request with a JSON body.
        /// HttpClient.GetAsync() does not support a body, so we use HttpRequestMessage directly.
        /// n8n webhook trigger nodes configured as GET still read from the request body.
        /// </summary>
        private static async Task<HttpResponseMessage> SendGetWithBodyAsync(HttpClient http, string url, object payload)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, url)
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
            };
            return await http.SendAsync(request);
        }
    }
}