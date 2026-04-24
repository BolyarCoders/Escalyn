using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Models.DTOs
{
    public class CaseOutDTO
    {
        public Guid CaseId { get; set; }
        public string Description { get; set; }
        public string Company { get; set; }
        public string Subject { get; set; }
        public string Language { get; set; }
        public string CreatedAt { get; set; } //Could be datetime - zavisi koceto kak go iska(TEST)
        public int WinRate { get; set; }
    }
}
