namespace CityVoice.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string RoleName { get; set; } // Dodaj za prikaz imena uloge
    }
}
