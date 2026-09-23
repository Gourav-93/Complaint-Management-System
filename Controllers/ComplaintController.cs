using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComplaintManagementSystem.Data;
using ComplaintManagementSystem.Models;

namespace ComplaintManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComplaintController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ComplaintController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetComplaints()
        {
            var complaints = await _context.Complaints
                .Include(c => c.User)
                .Include(c => c.Technician)
                .ToListAsync();

            return Ok(complaints);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetComplaint(int id)
        {
            var complaint = await _context.Complaints
                .Include(c => c.User)
                .Include(c => c.Technician)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (complaint == null)
            {
                return NotFound("Complaint not found");
            }

            return Ok(complaint);
        }

        [HttpPost]
        public async Task<IActionResult> CreateComplaint(Complaint complaint)
        {
            complaint.CreatedDate = DateTime.Now;

            _context.Complaints.Add(complaint);

            await _context.SaveChangesAsync();

            return Ok(complaint);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateComplaint(
            int id,
            Complaint complaint)
        {
            var existingComplaint =
                await _context.Complaints.FindAsync(id);

            if (existingComplaint == null)
            {
                return NotFound("Complaint not found");
            }

            existingComplaint.Title = complaint.Title;
            existingComplaint.Description = complaint.Description;
            existingComplaint.Category = complaint.Category;
            existingComplaint.Priority = complaint.Priority;
            existingComplaint.Status = complaint.Status;
            existingComplaint.UserId = complaint.UserId;
            existingComplaint.TechnicianId = complaint.TechnicianId;

            await _context.SaveChangesAsync();

            return Ok(existingComplaint);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComplaint(int id)
        {
            var complaint =
                await _context.Complaints.FindAsync(id);

            if (complaint == null)
            {
                return NotFound("Complaint not found");
            }

            _context.Complaints.Remove(complaint);

            await _context.SaveChangesAsync();

            return Ok("Complaint deleted successfully");
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchComplaints(
            string? search,
            string? status,
            string? priority,
            string? category)
        {
            var query = _context.Complaints
                .Include(c => c.User)
                .Include(c => c.Technician)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(c =>
                    c.Title.Contains(search) ||
                    c.Description.Contains(search) ||
                    c.Category.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(c => c.Status == status);
            }

            if (!string.IsNullOrWhiteSpace(priority))
            {
                query = query.Where(c => c.Priority == priority);
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(c => c.Category == category);
            }

            var complaints = await query.ToListAsync();

            return Ok(complaints);
        }
    }
}