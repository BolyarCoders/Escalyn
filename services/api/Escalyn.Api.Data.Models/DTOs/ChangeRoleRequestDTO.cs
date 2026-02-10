using Escalyn.Api.Data.Models.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Models.DTOs
{
    public class ChangeRoleRequestDTO
    {
        public UserRole NewRole { get; set; }
    }
}
