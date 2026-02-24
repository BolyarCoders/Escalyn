using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Models.DTOs
{
    public class CaseStatusUpdateDTO
    {
        public Guid CaseId { get; set; }
        public string Status { get; set; }
        public string CompanyEmail { get; set; }
        public string Summary { get; set; }

    }
}
