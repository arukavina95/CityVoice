// CityVoice/DTOs/RegisterDto.cs
using System.ComponentModel.DataAnnotations;

namespace CityVoice.DTOs
{
    public class RegisterDto
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; }

        // Nećemo ovdje eksplicitno tražiti RoleId pri registraciji,
        // već ćemo zadano dodijeliti 'Građanin' u kontroleru.
    }
}