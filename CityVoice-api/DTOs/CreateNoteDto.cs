// CityVoice/DTOs/CreateNoteDto.cs
using System.ComponentModel.DataAnnotations;

namespace CityVoice.DTOs
{
    public class CreateNoteDto
    {
        [Required(ErrorMessage = "Sadržaj bilješke je obavezan.")]
        [StringLength(1000, ErrorMessage = "Sadržaj bilješke ne smije prelaziti 1000 znakova.")]
        public string Content { get; set; }

        // ProblemId ne treba biti ovdje jer ćemo ga uzeti iz URL-a (npr. /api/Problems/{problemId}/Notes)
    }
}