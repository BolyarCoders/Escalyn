using Escalyn.Api.Data.Models;
using Escalyn.Api.Data.Models.DTOs;
using Escalyn.Api.Data.Repositories.IRepositories;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Text;
using System.Text.Json;

namespace Escalyn.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionsController : Controller
    {
        private readonly IQuestionRepository _questionRepository;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<QuestionsController> _logger;

        private const string N8nBaseUrl = "https://n8n-production-8af3.up.railway.app";

        public QuestionsController(
            IQuestionRepository questionRepository,
            IHttpClientFactory httpClientFactory,
            ILogger<QuestionsController> logger)
        {
            _questionRepository = questionRepository;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        // ─────────────────────────────────────────────────────────────
        // POST api/questions/create
        // ─────────────────────────────────────────────────────────────
        [HttpPost("create")]
        public async Task<IActionResult> CreateQuestions([FromBody] QuestionBodyDTO request)
        {
            try
            {
                if (!Guid.TryParse(request.CaseId, out Guid caseId))
                    return Forbid();

                QuestionBody questionBody = new QuestionBody
                {
                    CaseId = caseId
                };

                await _questionRepository.CreateBodyAsync(questionBody);

                var questions = request.Questions
                    .Select(questionDto => new Question
                    {
                        QuestionAsStr = questionDto.Question,
                        Answer = questionDto.Answer,
                        QuestionsBodyId = questionBody.Id
                    })
                    .ToList();

                foreach (var question in questions)
                {
                    await _questionRepository.CreateQuestionAsync(question);
                }

                return Ok(new { success = true });
            }
            catch
            {
                return Forbid();
            }
        }

        // ─────────────────────────────────────────────────────────────
        // GET api/questions/{caseId}
        // Returns all questions for a given case
        // ─────────────────────────────────────────────────────────────
        [HttpGet("{caseId}")]
        public async Task<IActionResult> GetQuestions(string caseId)
        {
            if (!Guid.TryParse(caseId, out Guid caseGuid))
                return BadRequest(new { success = false, errorCode = "INVALID_GUID", message = "Invalid case ID format." });

            var questionBody = await _questionRepository.GetByCaseIdAsync(caseGuid);
            if (questionBody == null || !questionBody.Questions.Any())
                return NotFound(new { success = false, errorCode = "QUESTIONS_NOT_FOUND", message = "No questions found for this case." });

            return Ok(new
            {
                success = true,
                data = questionBody.Questions.Select(q => new QuestionDTO
                {
                    Question = q.QuestionAsStr,
                    Answer = q.Answer
                })
            });
        }

        // ─────────────────────────────────────────────────────────────
        // PUT api/questions/{caseId}/answers
        // Save answers and forward them to n8n additional-info webhook
        // ─────────────────────────────────────────────────────────────
        [HttpPut("{caseId}/answers")]
        public async Task<IActionResult> SubmitAnswers(string caseId, [FromBody] List<QuestionDTO> answers)
        {
            if (!Guid.TryParse(caseId, out Guid caseGuid))
                return BadRequest(new { success = false, errorCode = "INVALID_GUID", message = "Invalid case ID format." });

            var questionBody = await _questionRepository.GetByCaseIdAsync(caseGuid);
            if (questionBody == null || !questionBody.Questions.Any())
                return NotFound(new { success = false, errorCode = "QUESTIONS_NOT_FOUND", message = "No questions found for this case." });

            // ── Save answers to DB ────────────────────────────────────
            foreach (var q in questionBody.Questions)
            {
                var match = answers.FirstOrDefault(a => a.Question == q.QuestionAsStr);
                if (match != null)
                {
                    q.Answer = match.Answer;
                    await _questionRepository.UpdateQuestionAsync(q);
                }
            }

            // ── Forward answers to n8n (GET + JSON body) ──────────────
            try
            {
                using var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(60);

                var answersPayload = new
                {
                    case_id = caseGuid,
                    answers = questionBody.Questions.Select((q, i) => new
                    {
                        id = i + 1,
                        question = q.QuestionAsStr,
                        answer = q.Answer
                    })
                };

                var response = await SendGetWithBodyAsync(http,
                    $"{N8nBaseUrl}/webhook/additional-info",
                    answersPayload);

                _logger.LogInformation(
                    "n8n additional-info → Status: {StatusCode}",
                    (int)response.StatusCode);

                if (!response.IsSuccessStatusCode)
                {
                    string body = await response.Content.ReadAsStringAsync();
                    _logger.LogError("n8n additional-info failed. Body: {Body}", body);

                    return StatusCode(StatusCodes.Status502BadGateway, new
                    {
                        success = false,
                        errorCode = "N8N_ADDITIONAL_INFO_FAILED",
                        message = "Answers saved but failed to reach the automation service."
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to forward answers to n8n for case {CaseId}", caseGuid);
                return StatusCode(StatusCodes.Status502BadGateway, new
                {
                    success = false,
                    errorCode = "N8N_UNREACHABLE",
                    message = "Answers saved but automation service is unreachable."
                });
            }

            return Ok(new { success = true, message = "Answers submitted and forwarded successfully." });
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
    }
}