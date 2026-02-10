using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Models
{
    public class TokenRefreshRequest
    {
        [Required]
        public string RefreshToken { get; set; }
    }
}
