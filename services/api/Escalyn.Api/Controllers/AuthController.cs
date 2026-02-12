using Escalyn.Api.Data.Models;
using Escalyn.Api.Data.Models.NHostModels;
using Escalyn.Api.Services.AuthServices.IAuthServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Escalyn.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly INhostAuthService _authService;

        public AuthController(INhostAuthService authService)
        {
            _authService = authService;
        }

        [AllowAnonymous]
        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _authService.SignUpAsync(request);
                return Ok(new
                {
                    success = true,
                    message = "Account created successfully.",
                    data = result
                });
            }
            catch (Exception ex) when (ex.Message.Contains("already exists"))
            {
                return Conflict(new
                {
                    success = false,
                    errorCode = "USER_ALREADY_EXISTS",
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    errorCode = "SIGNUP_FAILED",
                    message = ex.Message
                });
            }
        }

        [AllowAnonymous]
        [HttpPost("signin")]
        public async Task<IActionResult> SignIn([FromBody] SignInRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _authService.SignInAsync(request);
                return Ok(new
                {
                    success = true,
                    message = "Signed in successfully.",
                    data = result
                });
            }
            catch (Exception ex)
            {
                return Unauthorized(new
                {
                    success = false,
                    errorCode = "SIGNIN_FAILED",
                    message = ex.Message
                });
            }
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            var userId = User.FindFirst("x-hasura-user-id")?.Value
                         ?? User.FindFirst("sub")?.Value;
            var userEmail = User.FindFirst("https://hasura.io/jwt/claims/email")?.Value
                         ?? User.FindFirst("email")?.Value;
            var userRole = User.FindFirst("x-hasura-default-role")?.Value;

            return Ok(new
            {
                success = true,
                data = new
                {
                    id = userId,
                    email = userEmail,
                    role = userRole
                }
            });
        }
    }
}
