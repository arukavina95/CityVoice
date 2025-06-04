using CityVoice.Data;
using CityVoice.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CityVoice.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProblemTypesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProblemTypesController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Dohvaća sve tipove problema.
        /// </summary>
        /// <returns>Lista tipova problema.</returns>
        [HttpGet]
        [AllowAnonymous] // Svi mogu vidjeti listu tipova problema
        public async Task<ActionResult<IEnumerable<ProblemType>>> GetProblemTypes()
        {
            return await _context.ProblemTypes.ToListAsync();
        }

        // Opcionalno: Možeš dodati i endpoint za dodavanje/ažuriranje/brisanje tipova problema,
        // ali vjerojatno bi to trebalo biti samo za administratore. Za sada je samo GET.
        // [HttpPost]
        // [Authorize(Roles = "Administrator")]
        // public async Task<ActionResult<ProblemType>> PostProblemType(ProblemType problemType)
        // {
        //     _context.ProblemTypes.Add(problemType);
        //     await _context.SaveChangesAsync();
        //     return CreatedAtAction("GetProblemType", new { id = problemType.Id }, problemType);
        // }
    }
}