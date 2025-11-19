using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using NetTopologySuite;
using CityVoice.Data;
using CityVoice.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;

var options = new WebApplicationOptions
{
    Args = args,
    WebRootPath = "wwwroot"
};

var builder = WebApplication.CreateBuilder(options);

// Load ENV VARS from Railway
builder.Configuration.AddEnvironmentVariables();

// CONTROLLERS
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// SWAGGER (always ON)
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
        Description = "Bearer {token}"
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

// CORS
builder.Services.AddCors(p =>
{
    p.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// DB
builder.Services.AddDbContext<ApplicationDbContext>(opts =>
{
    opts.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        o => o.UseNetTopologySuite());
});

// AUTH SERVICE
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:Token"])),

            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["AppSettings:Issuer"],

            ValidateAudience = true,
            ValidAudience = builder.Configuration["AppSettings:Audience"],

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// NO HTTPS REDIRECT (Railway handles)
app.UseCors("AllowAll");

// STATIC FILES
app.UseStaticFiles();

// SWAGGER ALWAYS ENABLED
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "CityVoice API V1");
    c.RoutePrefix = "swagger";  // <-- ključ za Railwayss
});

// ROOT ENDPOINT — Railway needs this
app.MapGet("/", () =>
{
    return Results.Ok("CityVoice API running successfully on Railway.");
});

app.UseAuthentication();
app.UseAuthorization();

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