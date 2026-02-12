using Escalyn.Api.Data.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Models.NHostModels
{
    public class AuthResponse
    {
        public string AccessToken { get; set; }
        public UserDTO User { get; set; }
    }
}
