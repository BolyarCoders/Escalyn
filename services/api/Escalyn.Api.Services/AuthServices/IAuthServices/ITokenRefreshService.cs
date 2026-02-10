using Escalyn.Api.Data.Models.NHostModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Services.AuthServices.IAuthServices
{
    public interface ITokenRefreshService
    {
        Task<AuthResponse> RefreshAsync(string refreshToken);
        Task RevokeAsync(string refreshToken);
        Task RevokeAllAsync(Guid userId);
    }
}
