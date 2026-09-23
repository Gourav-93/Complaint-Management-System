document.addEventListener('DOMContentLoaded', () => {
    loadComplaintDetails();
});

async function loadComplaintDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    const loader = document.getElementById('detailsLoader');
    const content = document.getElementById('detailsContent');
    const errorState = document.getElementById('errorState');

    if (!id) {
        loader.style.display = 'none';
        errorState.style.display = 'block';
        return;
    }

    try {
        loader.style.display = 'flex';
        content.style.display = 'none';
        errorState.style.display = 'none';

        const complaint = await apiRequest(`/Complaint/${id}`);
        
        // Complaint Details
        document.getElementById('cId').textContent = `#${complaint.id}`;
        document.getElementById('cTitle').textContent = complaint.title;
        document.getElementById('cCategory').textContent = complaint.category;
        document.getElementById('cDate').textContent = formatDate(complaint.createdDate);
        document.getElementById('cDescription').textContent = complaint.description;
        
        // Badges
        const statusEl = document.getElementById('cStatus');
        statusEl.className = getStatusBadgeClass(complaint.status);
        statusEl.textContent = complaint.status;
        statusEl.style.fontSize = '1rem';
        statusEl.style.padding = '0.35rem 0.85rem';

        const priorityEl = document.getElementById('cPriority');
        priorityEl.className = getPriorityBadgeClass(complaint.priority);
        priorityEl.textContent = complaint.priority;
        priorityEl.style.fontSize = '1rem';
        priorityEl.style.padding = '0.35rem 0.85rem';

        // User
        if (complaint.user) {
            document.getElementById('uName').innerHTML = `<a href="user-details.html?id=${complaint.user.id}" style="text-decoration:none; color:var(--primary-color);">${complaint.user.name}</a>`;
            document.getElementById('uEmail').textContent = complaint.user.email;
            document.getElementById('uDept').textContent = complaint.user.department;
            document.getElementById('uPhone').textContent = complaint.user.number;
        } else {
            document.getElementById('uName').textContent = 'N/A';
        }

        // Technician
        if (complaint.technician) {
            document.getElementById('tName').innerHTML = `<a href="technician-details.html?id=${complaint.technician.id}" style="text-decoration:none; color:var(--primary-color);">${complaint.technician.name}</a>`;
            document.getElementById('tEmail').textContent = complaint.technician.email;
            document.getElementById('tDept').textContent = complaint.technician.department;
            document.getElementById('tSpec').textContent = complaint.technician.specialization;
        } else {
            document.getElementById('tName').textContent = 'N/A';
        }

        content.style.display = 'block';
    } catch (error) {
        errorState.style.display = 'block';
        showToast('Failed to load complaint details', 'error');
    } finally {
        loader.style.display = 'none';
    }
}
