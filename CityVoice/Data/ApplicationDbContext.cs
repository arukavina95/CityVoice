
namespace CityVoice.Data
{
    using CityVoice.Models; // Provjeri da i tvoji modeli imaju namespace CityVoice.Models
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
    using NetTopologySuite.Geometries; // Dodaj za Point tip
    

    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Problem> Problems { get; set; }
        public DbSet<ProblemType> ProblemTypes { get; set; }
        public DbSet<Status> Statuses { get; set; }
        public DbSet<Note> Notes { get; set; }

 

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Dodatne konfiguracije ako su potrebne, npr. za veze many-to-many
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Problem>()
                .HasOne(p => p.Reporter)
                .WithMany(u => u.ReportedProblems)
                .HasForeignKey(p => p.ReporterId)
                .OnDelete(DeleteBehavior.Cascade);

            // Inicijalni podaci (Seeding)
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Građanin" },
                new Role { Id = 2, Name = "Administrator" },
                new Role { Id = 3, Name = "Službenik" }
            );

            modelBuilder.Entity<Status>().HasData(
                new Status { Id = 1, Name = "Nova" },
                new Status { Id = 2, Name = "U obradi" },
                new Status { Id = 3, Name = "Riješeno" },
                new Status { Id = 4, Name = "Odbijeno" }
            );

            modelBuilder.Entity<ProblemType>().HasData(
                new ProblemType { Id = 1, Name = "Rupa na cesti" },
                new ProblemType { Id = 2, Name = "Kvar javne rasvjete" },
                new ProblemType { Id = 3, Name = "Ilegalno odlagalište otpada" },
                new ProblemType { Id = 4, Name = "Oštećena javna infrastruktura" },
                new ProblemType { Id = 5, Name = "Zagađenje okoliša" }
            );
        }
    }
} // ZATVORI NAMESPACE BLOK OVDJE