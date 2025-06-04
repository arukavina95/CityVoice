// CityVoice/Models/User.cs
namespace CityVoice.Models
{
    using System.Collections.Generic; // Za IEnumerable

    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public byte[] PasswordHash { get; set; } // Za pohranu heširane lozinke
        public byte[] PasswordSalt { get; set; } // Za pohranu soli

        public int RoleId { get; set; } // Vanjski ključ za ulogu
        public Role Role { get; set; } // Navigacijsko svojstvo za ulogu

        // Navigacijsko svojstvo za probleme koje je korisnik prijavio
        public ICollection<Problem> ReportedProblems { get; set; }
        // Navigacijsko svojstvo za bilješke koje je korisnik dodao
        public ICollection<Note> Notes { get; set; }

        public User()
        {
            ReportedProblems = new HashSet<Problem>();
            Notes = new HashSet<Note>();
        }
    }
}