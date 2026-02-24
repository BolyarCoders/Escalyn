using Escalyn.Api.Data.Models.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Models
{
    public class User
    {
        public Guid Id { get; set; }

        [EmailAddress]
        public string Email { get; set; }

        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Language { get; set; } // LowerCase!!

        public UserRole Role { get; set; } = UserRole.User;

        public bool EmailVerified { get; set; }

        public string? NhostUserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
        public List<Case> Cases { get; set; } = new List<Case>();
    }
}
