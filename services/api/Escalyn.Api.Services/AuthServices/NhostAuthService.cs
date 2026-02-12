using Escalyn.Api.Data.Models;
using Escalyn.Api.Data.Models.DTOs;
using Escalyn.Api.Data.Models.Enums;
using Escalyn.Api.Data.Models.NHostModels;
using Escalyn.Api.Data.Repositories.IRepositories;
using Escalyn.Api.Services.AuthServices.IAuthServices;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;

namespace Escalyn.Api.Services.AuthServices
{
    public class NhostAuthService : INhostAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly string _nhostAuthUrl;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<NhostAuthService> _logger;

        private static class NhostRoles
        {
            public const string User = "user";
            public const string Admin = "admin";
            public const string SuperAdmin = "superadmin";
        }

        public NhostAuthService(
            IConfiguration configuration,
            IUserRepository userRepository,
            ILogger<NhostAuthService> logger)
        {
            _httpClient = new HttpClient();
            _nhostAuthUrl = configuration["NHost:AuthUrl"] ??
                "https://jrpixlslkjplvkxzqsmb.auth.eu-central-1.nhost.run/v1";
            _userRepository = userRepository;
            _logger = logger;
        }

        public async Task<AuthResponse> SignUpAsync(SignUpRequest request)
        {
            try
            {
                if (await _userRepository.ExistsAsync(request.Email))
                    throw new Exception("User already exists in the system");

                var nhostRole = ToNhostRole(UserRole.User);

                var nhostRequest = new
                {
                    email = request.Email,
                    password = request.Password,
                    options = new
                    {
                        displayName = BuildDisplayName(request.FirstName, request.MiddleName, request.LastName),
                        metadata = new
                        {
                            firstName = request.FirstName,
                            middleName = request.MiddleName,
                            lastName = request.LastName,
                            phoneNumber = request.PhoneNumber,
                            language = request.Language,
                            role = nhostRole
                        },
                        defaultRole = nhostRole,
                        allowedRoles = new[] { nhostRole }
                    }
                };

                _logger.LogInformation("Signing up user {Email} with role {Role}", request.Email, UserRole.User);

                var response = await _httpClient.PostAsJsonAsync(
                    $"{_nhostAuthUrl}/signup/email-password",
                    nhostRequest
                );

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Nhost signup failed: {Error}", errorContent);
                    throw new Exception($"Sign up failed: {errorContent}");
                }

                var content = await response.Content.ReadAsStringAsync();
                _logger.LogInformation("Nhost signup successful for {Email}", request.Email);

                var nhostResponse = JsonSerializer.Deserialize<NhostSignUpResponse>(content,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                var user = new User
                {
                    Email = request.Email,
                    FirstName = request.FirstName,
                    MiddleName = request.MiddleName,
                    LastName = request.LastName,
                    PhoneNumber = request.PhoneNumber,
                    Language = request.Language,
                    Role = UserRole.User,
                    NhostUserId = nhostResponse?.Session?.User?.Id,
                    EmailVerified = nhostResponse?.Session?.User?.EmailVerified ?? false,
                    CreatedAt = DateTime.UtcNow
                };

                await _userRepository.CreateAsync(user);
                _logger.LogInformation("User created in database: {Email} with role: {Role}", request.Email, UserRole.User);

                return new AuthResponse
                {
                    AccessToken = nhostResponse?.Session?.AccessToken,
                    User = MapToDto(user)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sign up error for {Email}", request.Email);
                throw new Exception($"Sign up error: {ex.Message}", ex);
            }
        }

        public async Task<AuthResponse> SignInAsync(SignInRequest request)
        {
            try
            {
                var nhostRequest = new
                {
                    email = request.Email,
                    password = request.Password
                };

                _logger.LogInformation("Signing in user: {Email}", request.Email);

                var response = await _httpClient.PostAsJsonAsync(
                    $"{_nhostAuthUrl}/signin/email-password",
                    nhostRequest
                );

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Nhost signin failed: {Error}", errorContent);
                    throw new Exception($"Sign in failed: {errorContent}");
                }

                var content = await response.Content.ReadAsStringAsync();
                var nhostResponse = JsonSerializer.Deserialize<NhostSignInResponse>(content,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                var nhostUser = nhostResponse?.Session?.User;
                User? user = await _userRepository.GetByEmailAsync(request.Email);

                if (user == null)
                {
                    var (firstName, middleName, lastName, phoneNumber, language, role) =
                        ExtractMetadata(nhostUser?.Metadata);

                    user = new User
                    {
                        Email = request.Email,
                        FirstName = firstName ?? nhostUser?.FirstName,
                        MiddleName = middleName ?? nhostUser?.MiddleName,
                        LastName = lastName ?? nhostUser?.LastName,
                        PhoneNumber = phoneNumber ?? nhostUser?.PhoneNumber,
                        Language = language ?? nhostUser?.Language,
                        Role = role ?? UserRole.User,
                        NhostUserId = nhostUser?.Id,
                        EmailVerified = nhostUser?.EmailVerified ?? false,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _userRepository.CreateAsync(user);
                    _logger.LogInformation(
                        "Created user in database during sign-in: {Email} with role: {Role}",
                        request.Email, user.Role);
                }
                else
                {
                    user.EmailVerified = nhostUser?.EmailVerified ?? false;
                    user.NhostUserId = nhostUser?.Id;

                    if (!string.IsNullOrEmpty(nhostUser?.FirstName)) user.FirstName = nhostUser.FirstName;
                    if (!string.IsNullOrEmpty(nhostUser?.MiddleName)) user.MiddleName = nhostUser.MiddleName;
                    if (!string.IsNullOrEmpty(nhostUser?.LastName)) user.LastName = nhostUser.LastName;
                    if (!string.IsNullOrEmpty(nhostUser?.PhoneNumber)) user.PhoneNumber = nhostUser.PhoneNumber;
                    if (!string.IsNullOrEmpty(nhostUser?.Language)) user.Language = nhostUser.Language;

                    if (user.Role == default)
                    {
                        var (_, _, _, _, _, role) = ExtractMetadata(nhostUser?.Metadata);
                        user.Role = role ?? UserRole.User;
                    }

                    await _userRepository.UpdateAsync(user);
                }

                _logger.LogInformation("Sign in successful for user: {Email} with role: {Role}",
                    request.Email, user.Role);

                return new AuthResponse
                {
                    AccessToken = nhostResponse?.Session?.AccessToken,
                    User = MapToDto(user)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sign in error for {Email}", request.Email);
                throw new Exception($"Sign in error: {ex.Message}", ex);
            }
        }

        public async Task<bool> VerifyTokenAsync(string token)
        {
            try
            {
                return !string.IsNullOrEmpty(token);
            }
            catch
            {
                return false;
            }
        }

        private static string ToNhostRole(UserRole role) => role switch
        {
            UserRole.Admin => NhostRoles.Admin,
            UserRole.SuperAdmin => NhostRoles.SuperAdmin,
            _ => NhostRoles.User
        };

        private static UserRole FromNhostRole(string? nhostRole) => nhostRole switch
        {
            NhostRoles.Admin => UserRole.Admin,
            NhostRoles.SuperAdmin => UserRole.SuperAdmin,
            _ => UserRole.User
        };

        private static string BuildDisplayName(string? first, string? middle, string? last)
        {
            var parts = new[] { first, middle, last };
            return string.Join(" ", Array.FindAll(parts, p => !string.IsNullOrWhiteSpace(p)));
        }

        private static (string? firstName, string? middleName, string? lastName,
                        string? phoneNumber, string? language, UserRole? role)
            ExtractMetadata(object? metadata)
        {
            if (metadata is not JsonElement element)
                return (null, null, null, null, null, null);

            string? Get(string key) =>
                element.TryGetProperty(key, out var prop) ? prop.GetString() : null;

            var roleString = Get("role");
            UserRole? role = roleString is not null ? FromNhostRole(roleString) : null;

            return (Get("firstName"), Get("middleName"), Get("lastName"),
                    Get("phoneNumber"), Get("language"), role);
        }

        private static UserDTO MapToDto(User user) => new()
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