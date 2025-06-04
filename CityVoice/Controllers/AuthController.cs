// CityVoice/Controllers/AuthController.cs
using CityVoice.DTOs;
using CityVoice.Models;
using CityVoice.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CityVoice.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            try
            {
                var newUser = await _authService.Register(registerDto);
                var userDto = new UserDto
                {
                    Id = newUser.Id,
                    Username = newUser.Username,
                    Email = newUser.Email,
                    RoleName = newUser.Role?.Name // Uloge bi trebale biti učitane u AuthService
                };
                return CreatedAtAction(nameof(Register), new { id = newUser.Id }, userDto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login(LoginDto loginDto)
        {
            var response = await _authService.Login(loginDto);

            if (response == null)
            {
                return Unauthorized("Neispravno korisničko ime ili lozinka.");
            }

            return Ok(response);
        }
    }
}