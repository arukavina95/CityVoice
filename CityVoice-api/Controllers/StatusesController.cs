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
    public class StatusesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StatusesController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Dohvaća sve statuse problema.
        /// </summary>
        /// <returns>Lista statusa problema.</returns>
        [HttpGet]
        [AllowAnonymous] // Svi mogu vidjeti listu statusa problema
        public async Task<ActionResult<IEnumerable<Status>>> GetStatuses()
        {
            return await _context.Statuses.ToListAsync();
        }

        // Opcionalno: Slično kao za tipove problema, dodavanje/ažuriranje/brisanje statusa
        // vjerojatno bi trebalo biti samo za administratore. Za sada je samo GET.
        // [HttpPost]
        // [Authorize(Roles = "Administrator")]
        // public async Task<ActionResult<Status>> PostStatus(Status status)
        // {
        //     _context.Statuses.Add(status);
        //     await _context.SaveChangesAsync();
        //     return CreatedAtAction("GetStatus", new { id = status.Id }, status);
        // }
    }
}