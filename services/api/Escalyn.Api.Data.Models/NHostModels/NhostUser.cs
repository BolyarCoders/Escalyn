using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Models.NHostModels
{
    public class NhostUser
    {
        public string? Id { get; set; }
        public string? Email { get; set; }
        public string? DisplayName { get; set; }
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Language { get; set; } // LowerCase!!
        public bool EmailVerified { get; set; }
        public object? Metadata { get; set; }
    }
}
