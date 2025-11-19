using System.ComponentModel.DataAnnotations;

namespace CityVoice.Models
{
    public class Status
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } // npr. "Nova", "U obradi", "Riješeno"
        public ICollection<Problem> Problems { get; set; } = new List<Problem>();
    }
}
