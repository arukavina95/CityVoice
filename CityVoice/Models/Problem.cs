
using NetTopologySuite.Geometries; // Ovo je za Point
using System.ComponentModel.DataAnnotations;

namespace CityVoice.Models
{
    public class Problem
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        public string? ImageUrl { get; set; } // Putanja do slike
        public DateTime ReportedAt { get; set; } = DateTime.UtcNow;

        // Geoprostorni tip za lokaciju
        public Point Location { get; set; } // Ovo je NetTopologySuite.Geometries.Point

        public int ReporterId { get; set; }
        public User Reporter { get; set; }

        public int ProblemTypeId { get; set; }
        public ProblemType ProblemType { get; set; }

        public int StatusId { get; set; }
        public Status Status { get; set; }

        public ICollection<Note> Notes { get; set; } = new List<Note>();
    }

}
