using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Models.DTOs
{
    public class CaseCreateDTO
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; }

        [Required]
        [MaxLength(255)]
        public string Company { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string CompanyEmail { get; set; }

        [Required]
        [MaxLength(500)]
        public string Subject { get; set; }

        [MaxLength(10)]
        public string Language { get; set; }
    }
}
