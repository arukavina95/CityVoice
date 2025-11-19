namespace CityVoice.DTOs
{
    public class LoginResponseDto
    {
        public UserDto User { get; set; } // Možeš ponovno koristiti UserDto za podatke o korisniku
        public string Token { get; set; }
    }
}
