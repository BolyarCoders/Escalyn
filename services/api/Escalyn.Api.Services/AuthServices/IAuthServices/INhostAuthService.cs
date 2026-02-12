using Escalyn.Api.Data.Models.NHostModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Services.AuthServices.IAuthServices
{
    public interface INhostAuthService
    {
        Task<AuthResponse> SignUpAsync(SignUpRequest request);

        Task<AuthResponse> SignInAsync(SignInRequest request);

        Task<bool> VerifyTokenAsync(string token);
    }
}
