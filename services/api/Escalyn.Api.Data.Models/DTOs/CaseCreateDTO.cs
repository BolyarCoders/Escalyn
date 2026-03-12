using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

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

        public string Status { get; set; }

        /// <summary>
        /// Optional pre-supplied answers to AI clarifying questions (Step 2).
        /// If the initial-import webhook returns questions and this list is populated,
        /// answers are forwarded to /webhook/additional-info automatically.
        /// Order must match the questions returned by the AI.
        /// </summary>
        public List<string>? Answers { get; set; }
    }
}