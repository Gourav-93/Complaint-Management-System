using System.ComponentModel.DataAnnotations.Schema;

namespace ComplaintManagementSystem.Models
{
    public class Complaint
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public string Priority { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }

        public int UserId { get; set; }

        public int TechnicianId { get; set; }

        // Navigation Properties
        [ForeignKey("UserId")]
        public User? User { get; set; }

        [ForeignKey("TechnicianId")]
        public Technician? Technician { get; set; }
    }
}