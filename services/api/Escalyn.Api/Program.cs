using Escalyn.Api.Data;
using Escalyn.Api.Data.Repositories;
using Escalyn.Api.Data.Repositories.IRepositories;
using Escalyn.Api.Services.AuthServices;
using Escalyn.Api.Services.AuthServices.IAuthServices;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("NHostDb"));
});

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<INhostAuthService, NhostAuthService>();
builder.Services.AddScoped<ITokenRefreshService, TokenRefreshService>();

var jwtSecret = builder.Configuration["NHost:JwtSecret"];
var jwtIssuer = builder.Configuration["NHost:JwtIssuer"];

if (string.IsNullOrWhiteSpace(jwtSecret))
    throw new InvalidOperationException("NHost:JwtSecret is missing from configuration.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(
                                           Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = ClaimTypes.Role
        };

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                var identity = context.Principal?.Identity as ClaimsIdentity;
                if (identity == null) return Task.CompletedTask;

                var hasuraClaim = context.Principal.Claims
                    .FirstOrDefault(c => c.Type == "https://hasura.io/jwt/claims");

                if (hasuraClaim == null) return Task.CompletedTask;

                using var doc = JsonDocument.Parse(hasuraClaim.Value);

                if (doc.RootElement.TryGetProperty("x-hasura-default-role", out var role))
                    identity.AddClaim(new Claim(ClaimTypes.Role, role.GetString()!));

                if (doc.RootElement.TryGetProperty("x-hasura-user-id", out var userId)
                    && !identity.HasClaim(c => c.Type == "sub"))
                {
                    identity.AddClaim(new Claim("sub", userId.GetString()!));
                }

                return Task.CompletedTask;
            },

            // Return clean 401 JSON instead of an empty body.
            OnChallenge = context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                var body = JsonSerializer.Serialize(new
                {
                    message = "Unauthorized. Provide a valid Bearer token."
                });
                return context.Response.WriteAsync(body);
            },

            // Return clean 403 JSON instead of an empty body.
            OnForbidden = context =>
            {
                context.Response.StatusCode = 403;
                context.Response.ContentType = "application/json";
                var body = JsonSerializer.Serialize(new
                {
                    message = "Forbidden. You do not have the required role for this endpoint."
                });
                return context.Response.WriteAsync(body);
            }
        };
    });

builder.Services.AddAuthorization();

// ============================================================
// Swagger — with Bearer auth + role documentation
// ============================================================
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Escalyn API",
        Version = "v1",
        Description = """
            ## Authentication
            All protected endpoints require a **Bearer JWT** issued by Nhost.

            1. Call `POST /api/auth/signin` (or `/signup`) to receive an `accessToken`.
            2. Click **Authorize** (top right), paste `Bearer <your_token>` and confirm.
            3. All subsequent requests will include the token automatically.

            ## Roles
            | Role       | Access                                      |
            |------------|---------------------------------------------|
            | *(none)*   | `/api/auth/*` only                          |
            | User       | `/api/user/*`                               |
            | Admin      | `/api/user/*` + `/api/admin/*`              |
            | SuperAdmin | Everything including `/api/superadmin/*`    |
            """
    });

    // Security scheme definition
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste your Nhost accessToken here. Example: Bearer eyJhbGci..."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });


    c.UseInlineDefinitionsForEnums();
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Escalyn API v1");
        // Persist the Bearer token between page refreshes in dev
        c.ConfigObject.AdditionalItems["persistAuthorization"] = true;
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// Order matters: Authentication must come before Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();