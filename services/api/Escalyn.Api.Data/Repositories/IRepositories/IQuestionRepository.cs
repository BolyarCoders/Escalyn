using Escalyn.Api.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Repositories.IRepositories
{
    public interface IQuestionRepository
    {
        Task<QuestionBody?> GetByIdAsync(Guid id);
        Task<QuestionBody> CreateBodyAsync(QuestionBody questionBody);
        Task<Question> CreateQuestionAsync(Question question);
        Task<QuestionBody?> GetByCaseIdAsync(Guid caseId);
        Task UpdateQuestionAsync(Question question);

    }
}
