using Escalyn.Api.Data.Models;
using Escalyn.Api.Data.Models.DTOs;
using Escalyn.Api.Data.Models.Enums;
using Escalyn.Api.Data.Repositories.IRepositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Escalyn.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UsersController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userRepository.GetAllAsync();
            var dtos = users.Select(MapToDto);

            return Ok(new
            {
                success = true,
                data = dtos
            });
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var requesterId = GetRequesterId();
            var isAdminOrAbove = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");

            if (!isAdminOrAbove && requesterId != id)
                return Forbid();

            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { success = false, errorCode = "USER_NOT_FOUND", message = "User not found." });

            return Ok(new { success = true, data = MapToDto(user) });
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var requesterId = GetRequesterId();
            var isAdminOrAbove = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");

            if (!isAdminOrAbove && requesterId != id)
                return Forbid();

            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { success = false, errorCode = "USER_NOT_FOUND", message = "User not found." });

            if (!string.IsNullOrWhiteSpace(dto.FirstName)) user.FirstName = dto.FirstName;
            if (!string.IsNullOrWhiteSpace(dto.MiddleName)) user.MiddleName = dto.MiddleName;
            if (!string.IsNullOrWhiteSpace(dto.LastName)) user.LastName = dto.LastName;
            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber)) user.PhoneNumber = dto.PhoneNumber;
            if (!string.IsNullOrWhiteSpace(dto.Language)) user.Language = dto.Language;

            var updated = await _userRepository.UpdateAsync(user);
            return Ok(new { success = true, data = MapToDto(updated) });
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _userRepository.DeleteAsync(id);
            if (!deleted)
                return NotFound(new { success = false, errorCode = "USER_NOT_FOUND", message = "User not found." });

            return Ok(new { success = true, message = "User deleted successfully." });
        }

        [HttpPut("{id:guid}/role")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> ChangeRole(Guid id, [FromBody] ChangeRoleRequestDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var isSuperAdmin = User.IsInRole("SuperAdmin");

            if (dto.NewRole == UserRole.SuperAdmin && !isSuperAdmin)
                return Forbid();

            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { success = false, errorCode = "USER_NOT_FOUND", message = "User not found." });

            user.Role = dto.NewRole;
            var updated = await _userRepository.UpdateAsync(user);

            return Ok(new
            {
                success = true,
                message = $"Role updated to {dto.NewRole}.",
                data = MapToDto(updated)
            });
        }

        private Guid GetRequesterId()
        {
            var claim = User.FindFirst("x-hasura-user-id")?.Value
                     ?? User.FindFirst("sub")?.Value;

            return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
        }

        private static UserDTO MapToDto(Data.Models.User user) => new()
        {
            Id = user.Id.ToString(),
            Email = user.Email,
            FirstName = user.FirstName,
            MiddleName = user.MiddleName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            Language = user.Language,
            Role = user.Role,
            EmailVerified = user.EmailVerified
        };
    }
}
