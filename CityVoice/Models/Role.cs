using System.ComponentModel.DataAnnotations;

namespace CityVoice.Models
{
    public class Role
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } // npr. "Građanin", "Administrator", "Službenik"
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
