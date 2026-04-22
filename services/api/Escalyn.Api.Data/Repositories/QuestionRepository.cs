using Escalyn.Api.Data.Models;
using Escalyn.Api.Data.Models.DTOs;
using Escalyn.Api.Data.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Repositories
{
    public class QuestionRepository : IQuestionRepository
    {
        private readonly ApplicationDbContext _context;
        public QuestionRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<QuestionBody?> GetByIdAsync(Guid id)
        {
            return await _context.QuestionsBodies
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.Id == id);
        }

        public async Task<QuestionBody> CreateBodyAsync(QuestionBody questionBody)
        {
            QuestionBody newQuestionBody = new QuestionBody
            {
                CaseId = questionBody.CaseId
            };
            await _context.QuestionsBodies.AddAsync(newQuestionBody);
            await _context.SaveChangesAsync();
            return newQuestionBody;
        }
        public async Task<Question> CreateQuestionAsync(Question question)
        {
            Question newQuestion = new Question
            {
                QuestionAsStr = question.QuestionAsStr,
                Answer = question.Answer,
                QuestionsBodyId = question.QuestionsBodyId
            };
            await _context.Questions.AddAsync(newQuestion);
            await _context.SaveChangesAsync();
            return newQuestion;
        }

        public async Task<QuestionBody?> GetByCaseIdAsync(Guid caseId)
        {
            return await _context.QuestionsBodies
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.CaseId == caseId);
        }

        public async Task UpdateQuestionAsync(Question question)
        {
            _context.Questions.Update(question);
            await _context.SaveChangesAsync();
        }

        //DELETE EXISTS UPDATE - nyakoy drug put sega imam lekciya ot SoftUni :)
    }
}
