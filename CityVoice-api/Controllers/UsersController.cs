// CityVoice/Controllers/UsersController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CityVoice.Data;
using CityVoice.DTOs;
using CityVoice.Models;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization; // Dodaj za autorizaciju

namespace CityVoice.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize] // <-- Dodaj ovo. Ovo znači da samo PRIJAVLJENI korisnici mogu pristupiti.
    [Authorize(Roles = "Administrator")] // <-- Ili ovako, ako samo administratori smiju vidjeti listu korisnika
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Users
        // Opcionalno: Možeš dodati [Authorize] ovdje da samo prijavljeni korisnici mogu dohvaćati listu
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    RoleName = u.Role.Name
                })
                .ToListAsync();

            return Ok(users);
        }

        // Ovdje su se nalazili Register i Login, ali će biti premješteni u AuthController.
    }
}