// CityVoice/Models/Note.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CityVoice.Models
{
    public class Note
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(1000)] // Ograniči duljinu teksta bilješke
        public string Content { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        // Foreign Key za korisnika koji je dodao bilješku
        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; } // Navigacijski property za korisnika

        // Foreign Key za problem na koji se bilješka odnosi
        [Required]
        public int ProblemId { get; set; }
        [ForeignKey("ProblemId")]
        public Problem Problem { get; set; } // Navigacijski property za problem
    }
}