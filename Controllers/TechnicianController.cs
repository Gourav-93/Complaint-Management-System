using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComplaintManagementSystem.Data;
using ComplaintManagementSystem.Models;

namespace ComplaintManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TechnicianController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TechnicianController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Technician
        [HttpGet]
        public async Task<IActionResult> GetTechnicians()
        {
            var technicians = await _context.Technicians.ToListAsync();

            return Ok(technicians);
        }

        // GET: api/Technician/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTechnician(int id)
        {
            var technician = await _context.Technicians.FindAsync(id);

            if (technician == null)
            {
                return NotFound("Technician not found");
            }

            return Ok(technician);
        }

        // POST: api/Technician
        [HttpPost]
        public async Task<IActionResult> CreateTechnician(Technician technician)
        {
            _context.Technicians.Add(technician);

            await _context.SaveChangesAsync();

            return Ok(technician);
        }

        // PUT: api/Technician/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTechnician(
            int id,
            Technician technician)
        {
            var existingTechnician =
                await _context.Technicians.FindAsync(id);

            if (existingTechnician == null)
            {
                return NotFound("Technician not found");
            }

            existingTechnician.Name = technician.Name;
            existingTechnician.Email = technician.Email;
            existingTechnician.Specialization = technician.Specialization;
            existingTechnician.Department = technician.Department;

            await _context.SaveChangesAsync();

            return Ok(existingTechnician);
        }

        // DELETE: api/Technician/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTechnician(int id)
        {
            var technician =
                await _context.Technicians.FindAsync(id);

            if (technician == null)
            {
                return NotFound("Technician not found");
            }

            _context.Technicians.Remove(technician);

            await _context.SaveChangesAsync();

            return Ok("Technician deleted successfully");
        }
        [HttpGet("{id}/complaints")]
        public async Task<IActionResult> GetTechnicianComplaints(int id)
        {
            var technician = await _context.Technicians.FindAsync(id);

            if (technician == null)
            {
                return NotFound("Technician not found");
            }

            var complaints = await _context.Complaints
                .Include(c => c.User)
                .Include(c => c.Technician)
                .Where(c => c.TechnicianId == id)
                .ToListAsync();

            return Ok(complaints);
        }
    }
}