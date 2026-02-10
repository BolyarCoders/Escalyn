using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Models.NHostModels
{
    public class NhostSession
    {
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public NhostUser? User { get; set; }
    }
}
