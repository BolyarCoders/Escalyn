using Escalyn.Api.Data.Models.ExceptionModels;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Escalyn.Api.Middleware.Middlewares
{

    public class GlobalExceptionHandler
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(RequestDelegate next, ILogger<GlobalExceptionHandler> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (TokenExpiredException ex)
            {
                _logger.LogWarning("Token expired: {Message}", ex.Message);
                await WriteErrorAsync(context, HttpStatusCode.Forbidden, "TOKEN_EXPIRED", ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Unauthorized: {Message}", ex.Message);
                await WriteErrorAsync(context, HttpStatusCode.Unauthorized, "UNAUTHORIZED", ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("Not found: {Message}", ex.Message);
                await WriteErrorAsync(context, HttpStatusCode.NotFound, "NOT_FOUND", ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception");
                await WriteErrorAsync(context, HttpStatusCode.InternalServerError,
                    "SERVER_ERROR", "An unexpected error occurred.");
            }
        }

        private static Task WriteErrorAsync(
            HttpContext context,
            HttpStatusCode statusCode,
            string errorCode,
            string message)
        {
            context.Response.StatusCode = (int)statusCode;
            context.Response.ContentType = "application/json";

            var body = JsonSerializer.Serialize(new
            {
                success = false,
                errorCode,
                message
            });

            return context.Response.WriteAsync(body);
        }
    }
}
