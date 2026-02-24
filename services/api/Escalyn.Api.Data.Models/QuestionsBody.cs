using Escalyn.Api.Data.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Models
{
    public class QuestionsBody
    {
        public Guid Id { get; set; }
        public Case Case { get; set; }
        public Guid CaseId { get; set; }
        public List<QuestionObjectDTO> Questions { get; set; }
    }
}
