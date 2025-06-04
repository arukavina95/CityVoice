using System.ComponentModel.DataAnnotations;

namespace CityVoice.Models
{
    public class ProblemType
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } // npr. "Rupa na cesti", "Kvar rasvjete", "Ilegalno odlagalište"
        public ICollection<Problem> Problems { get; set; } = new List<Problem>();
    }
}
