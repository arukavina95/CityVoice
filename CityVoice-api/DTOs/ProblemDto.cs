using System.ComponentModel.DataAnnotations;
using NetTopologySuite.Geometries; // Za Point

namespace CityVoice.DTOs
{
    public class ProblemDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public DateTime ReportedAt { get; set; }

        // Svojstva za lokaciju (LatLng)
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public string ReporterUsername { get; set; } // Username onog tko je prijavio
        public string ProblemTypeName { get; set; } // Ime tipa problema
        public string StatusName { get; set; } // Ime statusa
    }
}
