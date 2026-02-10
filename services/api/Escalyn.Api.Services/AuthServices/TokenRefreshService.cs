using Escalyn.Api.Data.Models;
using Escalyn.Api.Data.Models.DTOs;
using Escalyn.Api.Data.Models.NHostModels;
using Escalyn.Api.Data.Repositories.IRepositories;
using Escalyn.Api.Services.AuthServices.IAuthServices;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Escalyn.Api.Services.AuthServices
{
    public class TokenRefreshService : ITokenRefreshService
    {
        private readonly HttpClient _httpClient;
        private readonly string _nhostAuthUrl;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<TokenRefreshService> _logger;

        private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(30);

        public TokenRefreshService(
            IConfiguration configuration,
            IRefreshTokenRepository refreshTokenRepository,
            IUserRepository userRepository,
            ILogger<TokenRefreshService> logger)
        {
            _httpClient = new HttpClient();
            _nhostAuthUrl = configuration["NHost:AuthUrl"] ??
                "https://jrpixlslkjplvkxzqsmb.auth.eu-central-1.nhost.run/v1";
            _refreshTokenRepository = refreshTokenRepository;
            _userRepository = userRepository;
            _logger = logger;
        }

        public async Task<AuthResponse> RefreshAsync(string refreshToken)
        {
            var storedToken = await _refreshTokenRepository.GetByTokenAsync(refreshToken);

            if (storedToken == null)
                throw new UnauthorizedAccessException("Refresh token not found.");

            if (storedToken.IsRevoked)
                throw new UnauthorizedAccessException("Refresh token has been revoked.");

            if (storedToken.ExpiresAt < DateTime.UtcNow)
                throw new UnauthorizedAccessException("Refresh token has expired.");

            _logger.LogInformation("Refreshing token for user {UserId}", storedToken.UserId);

            var response = await _httpClient.PostAsJsonAsync(
                $"{_nhostAuthUrl}/token",
                new { refreshToken = refreshToken }
            );

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError("Nhost token refresh failed: {Error}", error);

                await _refreshTokenRepository.RevokeAsync(storedToken);
                throw new UnauthorizedAccessException("Token refresh rejected by auth provider.");
            }

            var content = await response.Content.ReadAsStringAsync();
            var nhostResponse = JsonSerializer.Deserialize<NhostSignInResponse>(content,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            var newAccessToken = nhostResponse?.Session?.AccessToken;
            var newRefreshToken = nhostResponse?.Session?.RefreshToken;

            if (string.IsNullOrEmpty(newAccessToken) || string.IsNullOrEmpty(newRefreshToken))
                throw new Exception("Nhost returned an incomplete session after token refresh.");

            await _refreshTokenRepository.RevokeAsync(storedToken);

            var newStoredToken = new RefreshToken
            {
                Token = newRefreshToken,
                UserId = storedToken.UserId,
                ExpiresAt = DateTime.UtcNow.Add(RefreshTokenLifetime),
                CreatedAt = DateTime.UtcNow,
                IsRevoked = false
            };

            await _refreshTokenRepository.CreateAsync(newStoredToken);

            _logger.LogInformation("Token rotated successfully for user {UserId}", storedToken.UserId);

            var user = await _userRepository.GetByIdAsync(storedToken.UserId);
            if (user == null)
                throw new Exception($"User {storedToken.UserId} not found after token refresh.");

            return new AuthResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                User = MapToDto(user)
            };
        }

        public async Task RevokeAsync(string refreshToken)
        {
            var storedToken = await _refreshTokenRepository.GetByTokenAsync(refreshToken);

            if (storedToken == null)
                throw new KeyNotFoundException("Refresh token not found.");

            if (storedToken.IsRevoked)
                return; // Already revoked — idempotent, no error needed.

            await _refreshTokenRepository.RevokeAsync(storedToken);

            _logger.LogInformation(
                "Refresh token revoked for user {UserId}", storedToken.UserId);
        }

        public async Task RevokeAllAsync(Guid userId)
        {
            await _refreshTokenRepository.RevokeAllForUserAsync(userId);
            _logger.LogInformation("All refresh tokens revoked for user {UserId}", userId);
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
