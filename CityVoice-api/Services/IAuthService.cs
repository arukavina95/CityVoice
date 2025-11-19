// CityVoice/Services/IAuthService.cs
using CityVoice.DTOs;
using CityVoice.Models;
using System.Threading.Tasks;

namespace CityVoice.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto> Login(LoginDto loginDto);
        Task<User> Register(RegisterDto registerDto); // Već imaš ovu funkcionalnost u UsersControlleru, možemo je prebaciti ovdje
    }
}