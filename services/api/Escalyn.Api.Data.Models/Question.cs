using Escalyn.Api.Data.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Models
{
    public class Question
    {
        public Guid Id { get; set; }

        [JsonPropertyName("question")]
        public string QuestionAsStr { get; set; }
        public string Answer { get; set; }
        [JsonIgnore]
        public QuestionBody QuestionsBody { get; set; }
        [JsonIgnore]
        public Guid QuestionsBodyId { get; set; }
    }
}
