using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using CityVoice.Data;
using CityVoice.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;

var cultureInfo = new System.Globalization.CultureInfo("en-US");
System.Globalization.CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
System.Globalization.CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;

var options = new WebApplicationOptions
{
    Args = args,
    WebRootPath = "wwwroot"
};

var builder = WebApplication.CreateBuilder(options);

builder.Configuration.AddEnvironmentVariables();

// SERVICES
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ✨ Swagger — ENABLED in Production
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CityVoice API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddScoped<IAuthService, AuthService>();

// AUTH JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:Token"])
            ),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["AppSettings:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["AppSettings:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// ROLES
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", p => p.RequireRole("Administrator"));
    options.AddPolicy("RequireCitizenRole", p => p.RequireRole("Građanin"));
    options.AddPolicy("RequireOfficialRole", p => p.RequireRole("Službenik"));
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", p =>
    {
        p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// DIRECTORY BROWSER (optional)
builder.Services.AddDirectoryBrowser();

// DB
builder.Services.AddDbContext<ApplicationDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        x => x.UseNetTopologySuite()));

var app = builder.Build();

// STATIC FILES
app.UseStaticFiles();

// ✨ Swagger ALWAYS ON (production + dev)
app.UseSwagger();
app.UseSwaggerUI();

// ❗ Railway koristi samo HTTP (nema HTTPS unutar containera)
// Zato makni HTTPS redirection da izbjegneš warning
// app.UseHttpsRedirection();

app.UseCors("AllowAllOrigins");

app.UseAuthentication();
app.UseAuthorization();

// ROOT ENDPOINT — da znaš da API radi
app.MapGet("/", () => "CityVoice API is running 🚀");

app.MapControllers();

app.Run();



//using System;
//using Microsoft.AspNetCore.Builder;
//using Microsoft.Extensions.DependencyInjection;
//using Microsoft.Extensions.Hosting;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.Extensions.Configuration;
//using NetTopologySuite;
//using NetTopologySuite.Geometries;
//using CityVoice.Data;
//using CityVoice.Services;
//using Microsoft.AspNetCore.Authentication.JwtBearer;
//using Microsoft.IdentityModel.Tokens; 
//using System.Text; 
//using Microsoft.OpenApi.Models; 


//var cultureInfo = new System.Globalization.CultureInfo("en-US");
//System.Globalization.CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
//System.Globalization.CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;


//// ***** IZMJENA OVDJE: Koristi WebApplicationOptions za WebRootPath *****
//var options = new WebApplicationOptions
//{
//    Args = args,
//    WebRootPath = "wwwroot" // Postavi web root direktno u opcijama
//};

//var builder = WebApplication.CreateBuilder(options); // Sada koristi 'options' ovdje
//// ***** KRAJ IZMJENE *****

//builder.Configuration.AddEnvironmentVariables();

//// Add services to the container.
//builder.Services.AddControllers();
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen(c => // Promijeni u c => { ... }
//{
//    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CityVoice API", Version = "v1" });

//    // Dodaj definiciju sigurnosti za JWT Bearer token
//    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
//    {
//        Name = "Authorization",
//        Type = SecuritySchemeType.Http,
//        Scheme = "Bearer",
//        BearerFormat = "JWT",
//        In = ParameterLocation.Header,
//        Description = "Unesi 'Bearer ' (razmak nakon Bearer) + svoj JWT token u polje ispod.",
//    });

//    // Dodaj sigurnosni zahtjev za Bearer token
//    c.AddSecurityRequirement(new OpenApiSecurityRequirement
//    {
//        {
//            new OpenApiSecurityScheme
//            {
//                Reference = new OpenApiReference
//                {
//                    Type = ReferenceType.SecurityScheme,
//                    Id = "Bearer"
//                }
//            },
//            new string[] {}
//        }
//    });
//});
//builder.Services.AddScoped<IAuthService, AuthService>(); // Registriraj AuthService kao IAuthService



//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer(options =>
//    {
//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuerSigningKey = true,
//            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8
//                .GetBytes(builder.Configuration.GetSection("AppSettings:Token").Value)),
//            ValidateIssuer = true,
//            ValidIssuer = builder.Configuration.GetSection("AppSettings:Issuer").Value,
//            ValidateAudience = true,
//            ValidAudience = builder.Configuration.GetSection("AppSettings:Audience").Value,
//            ValidateLifetime = true, // Provjerava istek tokena
//            ClockSkew = TimeSpan.Zero // Nema tolerancije za istek tokena
//        };
//    });

//builder.Services.AddAuthorization(options =>
//{
//    options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Administrator"));
//    options.AddPolicy("RequireCitizenRole", policy => policy.RequireRole("Građanin"));
//    options.AddPolicy("RequireOfficialRole", policy => policy.RequireRole("Službenik"));
//});
//// ...

//// Konfiguriraj CORS-a
//builder.Services.AddCors(corsOptions => // Parametar preimenovan radi čitljivosti
//{
//    corsOptions.AddPolicy("AllowAllOrigins",
//        policy =>
//        {
//            policy.AllowAnyOrigin() // U produkciji ovo ograniči na React URL
//                  .AllowAnyMethod()
//                  .AllowAnyHeader();
//        });
//});

//// Ukloni ovu liniju jer je WebRootPath sada postavljen u WebApplicationOptions
//// builder.WebHost.UseWebRoot("wwwroot");
//builder.Services.AddDirectoryBrowser();

//// Konfiguriraj PostgreSQL i NetTopologySuite za prostorne podatke
//builder.Services.AddDbContext<ApplicationDbContext>(dbCtxOptions => // Parametar preimenovan radi čitljivosti
//    dbCtxOptions.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
//        o => o.UseNetTopologySuite()));


//var app = builder.Build();




//// Omogući posluživanje statičkih datoteka iz wwwroot foldera
//app.UseStaticFiles();

//// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//app.UseHttpsRedirection();


//// Koristi CORS policy PRIJE UseAuthorization() i MapControllers()
//app.UseCors("AllowAllOrigins");
//app.UseAuthentication(); // OBAVEZNO PRIJE app.UseAuthorization()
//app.UseAuthorization();

//app.MapControllers();

//app.Run();