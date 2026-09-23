using Microsoft.EntityFrameworkCore;
using ComplaintManagementSystem.Models;

namespace ComplaintManagementSystem.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
            
        }

        public DbSet<User> Users { get; set; }

        public DbSet<Technician> Technicians { get; set; }

        public DbSet<Complaint> Complaints { get; set; }
    }
}