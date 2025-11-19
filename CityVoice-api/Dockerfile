# ============================
# STAGE 1 — BUILD
# ============================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copy project file(s)
COPY CityVoice.csproj ./

# Restore NuGet packages
RUN dotnet restore

# Copy the rest of the project
COPY . .

# Publish in Release mode
RUN dotnet publish -c Release -o /app


# ============================
# STAGE 2 — RUNTIME
# ============================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

# Copy published output
COPY --from=build /app .

# Expose port 8080 (Railway default)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Start the application
ENTRYPOINT ["dotnet", "CityVoice.dll"]
