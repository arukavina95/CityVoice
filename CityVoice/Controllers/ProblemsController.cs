using CityVoice.Data;
using CityVoice.DTOs;
using CityVoice.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq; // Važno: Dodano za LINQ metode poput .Where() i .Any()
using System.Security.Claims; // Važno: Dodano za ClaimTypes
using System.Threading.Tasks;

namespace CityVoice.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProblemsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ProblemsController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        /// <summary>
        /// Dohvaća listu problema s opcionalnim filtriranjem i pretraživanjem.
        /// </summary>
        /// <param name="statusId">Filtriraj po ID-u statusa (npr. 1 za "Nova", 2 za "U rješavanju").</param>
        /// <param name="problemTypeId">Filtriraj po ID-u tipa problema.</param>
      
        /// <param name="latitude">Geografska širina za pretraživanje po radijusu.</param>
        /// <param name="longitude">Geografska dužina za pretraživanje po radijusu.</param>
        /// <param name="radiusKm">Radijus u kilometrima za pretraživanje po lokaciji (zahtijeva latitude i longitude).</param>
        /// <returns>Filtrirana lista problema.</returns>
        [HttpGet]
        [AllowAnonymous] // Svi mogu pregledavati probleme, filtrirane ili ne
        public async Task<ActionResult<IEnumerable<ProblemDto>>> GetProblems(
            [FromQuery] int? statusId,
            [FromQuery] int? problemTypeId,
            [FromQuery] double? latitude,
            [FromQuery] double? longitude,
            [FromQuery] double? radiusKm)
        {
            // Počni s dohvaćanjem svih problema s uključenim navigacijskim propertijima
            var problemsQuery = _context.Problems
                .Include(p => p.Reporter)
                .Include(p => p.ProblemType)
                .Include(p => p.Status)
                .AsQueryable(); // Važno: Koristi AsQueryable() za dinamičko dodavanje filtera

            // Filtriranje po statusu
            if (statusId.HasValue)
            {
                problemsQuery = problemsQuery.Where(p => p.StatusId == statusId.Value);
            }

            // Filtriranje po tipu problema
            if (problemTypeId.HasValue)
            {
                problemsQuery = problemsQuery.Where(p => p.ProblemTypeId == problemTypeId.Value);
            }

     

            // Filtriranje po lokaciji (radijusu)
            if (latitude.HasValue && longitude.HasValue && radiusKm.HasValue)
            {
                // Kreiraj točku iz proslijeđenih koordinata
                var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
                var searchPoint = geometryFactory.CreatePoint(new Coordinate(longitude.Value, latitude.Value));

                // Konvertiraj radijus iz kilometara u stupnjeve (grub približak)
                // Na ekvatoru 1 stupanj geografske širine je ~111 km.
                // Ovo je vrlo gruba aproksimacija i nije precizna za sve lokacije.
                // Za preciznije geografsko pretraživanje, koristila bi se ST_DWithin funkcija u bazi (PostGIS).
                // Trenutno EF Core s NetTopologySuite podržava Distance.
                var distanceDegrees = radiusKm.Value / 111.0; // Gruba konverzija KM u stupnjeve

                problemsQuery = problemsQuery.Where(p => p.Location.Distance(searchPoint) <= distanceDegrees);
            }

            // Izvrši upit i mapiraj rezultate u DTO
            var problems = await problemsQuery
                .Select(p => new ProblemDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    ImageUrl = p.ImageUrl,
                    ReportedAt = p.ReportedAt,
                    Latitude = p.Location.Y,
                    Longitude = p.Location.X,
                    ReporterUsername = p.Reporter.Username,
                    ProblemTypeName = p.ProblemType.Name,
                    StatusName = p.Status.Name
                })
                .ToListAsync();

            return Ok(problems);
        }

        /// <summary>
        /// Dohvaća detalje pojedinog problema.
        /// </summary>
        /// <param name="id">ID problema.</param>
        /// <returns>Detalji problema s bilješkama.</returns>
        [HttpGet("{id}")]
        [AllowAnonymous] // Svi mogu vidjeti detalje pojedinog problema
        public async Task<ActionResult<ProblemDto>> GetProblem(int id)
        {
            var problem = await _context.Problems
                .Include(p => p.Reporter)
                .Include(p => p.ProblemType)
                .Include(p => p.Status)
                .Include(p => p.Notes)
                    .ThenInclude(n => n.User)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (problem == null)
            {
                return NotFound();
            }

            var problemDto = new ProblemDto
            {
                Id = problem.Id,
                Title = problem.Title,
                Description = problem.Description,
                ImageUrl = problem.ImageUrl,
                ReportedAt = problem.ReportedAt,
                Latitude = problem.Location.Y,
                StatusName = problem.Status.Name, // Dodano
                Longitude = problem.Location.X,
                ReporterUsername = problem.Reporter.Username,
                ProblemTypeName = problem.ProblemType.Name
                // StatusName je već dohvaćen iz Status navigacijskog propertija
            };

            return Ok(problemDto);
        }

        /// <summary>
        /// Kreira novi problem. Samo prijavljeni građani mogu prijaviti problem.
        /// </summary>
        /// <param name="createProblemDto">Podaci za kreiranje problema, uključujući opcionalnu sliku.</param>
        /// <returns>Kreirani problem.</returns>
        [HttpPost]
        [Consumes("multipart/form-data")]
        [Authorize(Roles = "Građanin,Administrator")] // Samo prijavljeni korisnici s ulogom "Građanin i admin"
        public async Task<ActionResult<ProblemDto>> CreateProblem([FromForm] CreateProblemDto createProblemDto)
        {
            var reporterIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (reporterIdClaim == null || !int.TryParse(reporterIdClaim.Value, out int reporterId))
            {
                return Unauthorized("Korisnik nije prijavljen ili ID korisnika nije valjan.");
            }

            var reporter = await _context.Users.FindAsync(reporterId);
            if (reporter == null)
            {
                return Unauthorized("Prijavljeni korisnik nije pronađen.");
            }

            var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
            var locationPoint = geometryFactory.CreatePoint(new Coordinate(createProblemDto.Longitude, createProblemDto.Latitude));

            string imageUrl = null;
            if (createProblemDto.Image != null && createProblemDto.Image.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "images");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + createProblemDto.Image.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await createProblemDto.Image.CopyToAsync(fileStream);
                }
                imageUrl = "/images/" + uniqueFileName;
            }

            var initialStatus = await _context.Statuses.FirstOrDefaultAsync(s => s.Name == "Nova");
            if (initialStatus == null)
            {
                return StatusCode(500, "Inicijalni status 'Nova' nije pronađen u bazi podataka.");
            }

            var problem = new Problem
            {
                Title = createProblemDto.Title,
                Description = createProblemDto.Description,
                Location = locationPoint,
                ImageUrl = imageUrl,
                ReportedAt = DateTime.UtcNow,
                ReporterId = reporter.Id,
                ProblemTypeId = createProblemDto.ProblemTypeId,
                StatusId = initialStatus.Id
            };

            _context.Problems.Add(problem);
            await _context.SaveChangesAsync();

            await _context.Entry(problem).Reference(p => p.ProblemType).LoadAsync();
            await _context.Entry(problem).Reference(p => p.Status).LoadAsync();

            var createdProblemDto = new ProblemDto
            {
                Id = problem.Id,
                Title = problem.Title,
                Description = problem.Description,
                ImageUrl = problem.ImageUrl,
                ReportedAt = problem.ReportedAt,
                Latitude = problem.Location.Y,
                Longitude = problem.Location.X,
                ReporterUsername = reporter.Username,
                ProblemTypeName = problem.ProblemType.Name,
                StatusName = problem.Status.Name
            };

            return CreatedAtAction(nameof(GetProblem), new { id = problem.Id }, createdProblemDto);
        }

        /// <summary>
        /// Ažurira status problema. Samo administratori ili službenici mogu mijenjati status.
        /// </summary>
        /// <param name="id">ID problema.</param>
        /// <param name="statusId">Novi ID statusa.</param>
        /// <returns>NoContent ako je uspješno.</returns>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Administrator,Službenik")]
        public async Task<IActionResult> UpdateProblemStatus(int id, [FromBody] int statusId)
        {
            var problem = await _context.Problems.FindAsync(id);

            if (problem == null)
            {
                return NotFound();
            }

            var newStatus = await _context.Statuses.FindAsync(statusId);
            if (newStatus == null)
            {
                return BadRequest("Navedeni status ne postoji.");
            }

            problem.StatusId = statusId;
            _context.Entry(problem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProblemExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        /// <summary>
        /// Briše problem. Samo administratori mogu brisati probleme.
        /// </summary>
        /// <param name="id">ID problema za brisanje.</param>
        /// <returns>NoContent ako je uspješno.</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> DeleteProblem(int id)
        {
            var problem = await _context.Problems.FindAsync(id);
            if (problem == null)
            {
                return NotFound();
            }

            // Obriši sliku s diska ako postoji
            if (!string.IsNullOrEmpty(problem.ImageUrl))
            {
                var imagePath = Path.Combine(_env.WebRootPath, problem.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(imagePath))
                {
                    System.IO.File.Delete(imagePath);
                }
            }

            _context.Problems.Remove(problem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Dohvaća sve bilješke za određeni problem.
        /// </summary>
        /// <param name="problemId">ID problema za koji se dohvaćaju bilješke.</param>
        /// <returns>Lista bilješki.</returns>
        [HttpGet("{problemId}/Notes")]
        [AllowAnonymous] // Svi mogu pregledavati bilješke za problem
        public async Task<ActionResult<IEnumerable<NoteDto>>> GetNotesForProblem(int problemId)
        {
            if (!await _context.Problems.AnyAsync(p => p.Id == problemId))
            {
                return NotFound($"Problem s ID-jem {problemId} nije pronađen.");
            }

            var notes = await _context.Notes
                .Where(n => n.ProblemId == problemId)
                .Include(n => n.User)
                .OrderBy(n => n.CreatedAt)
                .Select(n => new NoteDto
                {
                    Id = n.Id,
                    Content = n.Content,
                    CreatedAt = n.CreatedAt,
                    Username = n.User.Username
                })
                .ToListAsync();

            return Ok(notes);
        }

        /// <summary>
        /// Dodaje novu bilješku na određeni problem.
        /// </summary>
        /// <param name="problemId">ID problema na koji se dodaje bilješka.</param>
        /// <param name="createNoteDto">Podaci za kreiranje bilješke.</param>
        /// <returns>Kreirana bilješka.</returns>
        [HttpPost("{problemId}/Notes")]
        [Authorize(Roles = "Administrator,Službenik")] // Samo administratori i službenici mogu dodavati bilješke
        public async Task<ActionResult<NoteDto>> AddNoteToProblem(int problemId, [FromBody] CreateNoteDto createNoteDto)
        {
            var problem = await _context.Problems.FindAsync(problemId);
            if (problem == null)
            {
                return NotFound($"Problem s ID-jem {problemId} nije pronađen.");
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized("Nije moguće identificirati prijavljenog korisnika.");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return Unauthorized("Prijavljeni korisnik nije pronađen u bazi podataka.");
            }

            var note = new Note
            {
                Content = createNoteDto.Content,
                CreatedAt = DateTime.UtcNow,
                UserId = userId,
                ProblemId = problemId
            };

            _context.Notes.Add(note);
            await _context.SaveChangesAsync();

            var noteDto = new NoteDto
            {
                Id = note.Id,
                Content = note.Content,
                CreatedAt = note.CreatedAt,
                Username = user.Username
            };

            return CreatedAtAction(
                nameof(GetNotesForProblem),
                new { problemId = problemId },
                noteDto);
        }

        private bool ProblemExists(int id)
        {
            return _context.Problems.Any(e => e.Id == id);
        }
    }
}