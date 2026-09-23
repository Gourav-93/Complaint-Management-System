document.addEventListener('DOMContentLoaded', () => {
    loadTechnicianDetails();
});

async function loadTechnicianDetails() {
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

        // Load Tech info
        const tech = await apiRequest(`/Technician/${id}`);
        document.getElementById('tNameTitle').textContent = tech.name;
        document.getElementById('tId').textContent = `#${tech.id}`;
        document.getElementById('tEmail').textContent = tech.email;
        document.getElementById('tSpec').textContent = tech.specialization;
        document.getElementById('tDept').textContent = tech.department;

        // Load Tech Complaints
        const complaints = await apiRequest(`/Technician/${id}/complaints`);
        renderComplaints(complaints);

        content.style.display = 'block';
    } catch (error) {
        errorState.style.display = 'block';
        showToast('Failed to load technician details', 'error');
    } finally {
        loader.style.display = 'none';
    }
}

function renderComplaints(complaints) {
    const tbody = document.getElementById('techComplaintsBody');
    const emptyState = document.getElementById('emptyState');
    tbody.innerHTML = '';

    if (complaints.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        complaints.forEach(complaint => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><a href="complaint-details.html?id=${complaint.id}" style="text-decoration:none; color:var(--primary-color);">#${complaint.id}</a></td>
                <td style="font-weight: 500;">${complaint.title}</td>
                <td>${complaint.category}</td>
                <td><span class="${getPriorityBadgeClass(complaint.priority)}">${complaint.priority}</span></td>
                <td><span class="${getStatusBadgeClass(complaint.status)}">${complaint.status}</span></td>
                <td>${complaint.user ? `<a href="user-details.html?id=${complaint.user.id}" style="text-decoration:none; color:var(--primary-color);">${complaint.user.name}</a>` : 'N/A'}</td>
                <td>${formatDate(complaint.createdDate)}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}
