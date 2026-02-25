
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Models
{
    public class Case
    {
        public Guid Id { get; set; }
        public User User { get; set; }
        public Guid UserId { get; set; }
        public string Description { get; set; }
        public string Company { get; set; }
        public string CompanyEmail { get; set; }
        public string Subject { get; set; }
        public string Language { get; set; } // ot User
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }  
        public List<string> Summaries { get; set; }
        public List<QuestionBody> Questions { get; set; }
    }
}
