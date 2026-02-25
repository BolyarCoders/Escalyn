using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Models.DTOs
{
    public class QuestionBodyDTO
    {
        public string CaseId { get; set; }
        public List<QuestionDTO> Questions { get; set; }
    }
}
