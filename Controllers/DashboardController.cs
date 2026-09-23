using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComplaintManagementSystem.Data;

namespace ComplaintManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            var totalUsers = await _context.Users.CountAsync();

            var totalTechnicians = await _context.Technicians.CountAsync();

            var totalComplaints = await _context.Complaints.CountAsync();

            var pendingComplaints = await _context.Complaints.CountAsync(c => c.Status == "Pending");

            var inProgressComplaints = await _context.Complaints.CountAsync(c => c.Status == "In Progress");

            var resolvedComplaints = await _context.Complaints.CountAsync(c => c.Status == "Resolved");

            var highPriorityComplaints = await _context.Complaints.CountAsync(c => c.Priority == "High");

            var statistics = new
            {
                TotalUsers = totalUsers,
                TotalTechnicians = totalTechnicians,
                TotalComplaints = totalComplaints,
                PendingComplaints = pendingComplaints,
                InProgressComplaints = inProgressComplaints,
                ResolvedComplaints = resolvedComplaints,
                HighPriorityComplaints = highPriorityComplaints
            };

            return Ok(statistics);
        }
    }
}