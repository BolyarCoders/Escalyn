FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Escalyn.Api/Escalyn.Api.csproj                         Escalyn.Api/
COPY Escalyn.Api.Data/Escalyn.Api.Data.csproj               Escalyn.Api.Data/
COPY Escalyn.Api.Data.Models/Escalyn.Api.Data.Models.csproj Escalyn.Api.Data.Models/
COPY Escalyn.Api.GCommon/Escalyn.Api.GCommon.csproj         Escalyn.Api.GCommon/
COPY Escalyn.Api.Middleware/Escalyn.Api.Middleware.csproj   Escalyn.Api.Middleware/
COPY Escalyn.Api.Services/Escalyn.Api.Services.csproj       Escalyn.Api.Services/

RUN dotnet restore Escalyn.Api/Escalyn.Api.csproj

COPY . .
RUN dotnet publish Escalyn.Api/Escalyn.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "Escalyn.Api.dll"]