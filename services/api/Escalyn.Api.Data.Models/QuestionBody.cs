using Escalyn.Api.Data.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Models
{
    public class QuestionBody
    {
        public Guid Id { get; set; }

        [JsonIgnore]
        public Case Case { get; set; }
        public Guid CaseId { get; set; }
        public List<Question> Questions { get; set; }
    }
}
