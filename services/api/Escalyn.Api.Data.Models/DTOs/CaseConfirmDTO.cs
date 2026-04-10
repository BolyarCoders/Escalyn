using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Models.DTOs
{
    public class CaseConfirmDTO
    {
        public List<QuestionAnswerDTO> Answers { get; set; } = new();
    }
}
