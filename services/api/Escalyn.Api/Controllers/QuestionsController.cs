using Escalyn.Api.Data.Models;
using Escalyn.Api.Data.Models.DTOs;
using Escalyn.Api.Data.Repositories.IRepositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Escalyn.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionsController : Controller
    {
        private readonly IQuestionRepository _questionRepository;
        public QuestionsController(IQuestionRepository questionRepository)
        {
            _questionRepository = questionRepository;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateQuestions([FromBody] QuestionBodyDTO request)
        {
            try
            {
                bool isValidGuid = Guid.TryParse(request.CaseId, out Guid caseId);
                if (!isValidGuid)
                {
                    return Forbid();
                }
                QuestionBody? questionBody = new QuestionBody
                {
                    CaseId = caseId
                };
                if (questionBody != null)
                {
                    await _questionRepository.CreateBodyAsync(questionBody);
                }
                else
                {
                    return Forbid();
                }
                foreach (var questionDto in request.Questions)
                {
                    Question question = new Question
                    {
                        QuestionAsStr = questionDto.Question,
                        Answer = questionDto.Answer
                    };
                    await _questionRepository.CreateQuestionAsync(question);
                }
                return Ok();
            }
            catch
            {
                return Forbid();
            }
            
        }
    }
}
