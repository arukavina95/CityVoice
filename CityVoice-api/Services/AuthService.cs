// CityVoice/Services/AuthService.cs
using CityVoice.Data;
using CityVoice.DTOs;
using CityVoice.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration; // Za pristup konfiguraciji (JWT secret key)
using Microsoft.IdentityModel.Tokens; // Za SymmetricSecurityKey
using System;
using System.IdentityModel.Tokens.Jwt; // Za JwtSecurityTokenHandler
using System.Security.Claims; // Za Claims
using System.Security.Cryptography; // Za hashiranje lozinke
using System.Text;
using System.Threading.Tasks;

namespace CityVoice.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Metoda za registraciju (prebacimo iz UsersControllera ovdje)
        public async Task<User> Register(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username || u.Email == registerDto.Email))
            {
                // Možeš baciti iznimku ili vratiti null, ovisno o željenom ponašanju
                throw new ArgumentException("Korisničko ime ili email već postoji.");
            }

            var citizenRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Građanin");
            if (citizenRole == null)
            {
                throw new InvalidOperationException("Uloga 'Građanin' nije pronađena.");
            }

            CreatePasswordHash(registerDto.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var newUser = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                RoleId = citizenRole.Id
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return newUser;
        }

        // Metoda za prijavu
        public async Task<LoginResponseDto> Login(LoginDto loginDto)
        {
            var user = await _context.Users
                .Include(u => u.Role) // Uključi ulogu da možemo dobiti ime uloge
                .FirstOrDefaultAsync(u => u.Username == loginDto.Username);

            if (user == null)
            {
                return null; // Korisnik nije pronađen
            }

            if (!VerifyPasswordHash(loginDto.Password, user.PasswordHash, user.PasswordSalt))
            {
                return null; // Pogrešna lozinka
            }

            // Korisnik je uspješno prijavljen, generiraj JWT token
            var token = CreateToken(user);

            var userDto = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                RoleName = user.Role?.Name // Koristi ?. operator za sigurnost
            };

            return new LoginResponseDto { User = userDto, Token = token };
        }

        // Pomoćne metode za hashiranje/provjeru lozinke (kopiraj iz UsersControllera)
        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }
        }

        private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512(passwordSalt))
            {
                var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
                for (int i = 0; i < computedHash.Length; i++)
                {
                    if (computedHash[i] != passwordHash[i]) return false;
                }
            }
            return true;
        }

        // Metoda za generiranje JWT tokena
        private string CreateToken(User user)
        {
            // Claims (tvrdnje) koje će biti uključene u token
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.Name) // Dodaj ulogu korisnika
            };

            // Ključ za potpisivanje tokena (mora biti tajna i jaka!)
            // Čitaj iz appsettings.json
            var tokenKey = _configuration.GetSection("AppSettings:Token").Value;
            if (string.IsNullOrEmpty(tokenKey))
            {
                throw new InvalidOperationException("JWT Token key is not configured in appsettings.json.");
            }
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));

            // Kredencijali za potpisivanje
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            // Opis tokena (tko ga je izdao, kome je namijenjen, kada istječe, itd.)
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7), // Token istječe za 7 dana
                SigningCredentials = creds,
                Issuer = _configuration.GetSection("AppSettings:Issuer").Value, // Izdavatelj
                Audience = _configuration.GetSection("AppSettings:Audience").Value // Primatelj
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}