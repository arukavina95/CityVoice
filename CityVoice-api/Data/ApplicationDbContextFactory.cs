// Npr. u folderu Data: CityVoice/Data/ApplicationDbContextFactory.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using NetTopologySuite; // Za NtsGeometryServices, UseNetTopologySuite

namespace CityVoice.Data
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            // Ovdje ručno učitavamo konfiguraciju da bi EF alati mogli dobiti connection string
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json") // Učitaj standardni appsettings
                .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development"}.json", optional: true) // Učitaj specifični za okolinu
                .Build();

            var builder = new DbContextOptionsBuilder<ApplicationDbContext>();

            // Dohvati connection string iz konfiguracije
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            // Konfiguriraj DbContextOptions s connection stringom i NetTopologySuite podrškom
            builder.UseNpgsql(connectionString,
                x => x.UseNetTopologySuite());

            return new ApplicationDbContext(builder.Options);
        }
    }
}