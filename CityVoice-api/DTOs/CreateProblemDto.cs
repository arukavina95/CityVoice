using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http; // Za IFormFile

namespace CityVoice.DTOs
{
    public class CreateProblemDto
    {
        [Required(ErrorMessage = "Naslov je obavezan.")]
        [StringLength(100, ErrorMessage = "Naslov ne smije biti duži od 100 znakova.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Opis je obavezan.")]
        public string Description { get; set; }

        // Koordinate lokacije
        [Required(ErrorMessage = "Geografska širina je obavezna.")]
        [Range(-90.0, 90.0, ErrorMessage = "Latitude mora biti između -90 i 90.")]
        public double Latitude { get; set; }

        [Required(ErrorMessage = "Geografska dužina je obavezna.")]
        [Range(-180.0, 180.0, ErrorMessage = "Longitude mora biti između -180 i 180.")]
        public double Longitude { get; set; }

        // Za upload slike
        public IFormFile? Image { get; set; } // Opcionalno

        [Required(ErrorMessage = "Tip problema je obavezan.")]
        public int ProblemTypeId { get; set; }

        // Ne treba StatusId, jer je inicijalno "Nova"
        // Ne treba ReporterId, jer će se dohvatiti iz JWT-a
    }
}
