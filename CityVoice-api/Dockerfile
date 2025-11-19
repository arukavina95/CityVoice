# ============================
# STAGE 1 — BUILD
# ============================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY ./CityVoice-api/CityVoice.csproj ./
RUN dotnet restore

COPY ./CityVoice-api/. .
RUN dotnet publish -c Release -o /app


# ============================
# STAGE 2 — RUNTIME
# ============================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "CityVoice.dll"]
