document.addEventListener('DOMContentLoaded', () => {
    loadUserDetails();
});

async function loadUserDetails() {
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

        // Load User info
        const user = await apiRequest(`/User/${id}`);
        document.getElementById('uNameTitle').textContent = user.name;
        document.getElementById('uId').textContent = `#${user.id}`;
        document.getElementById('uEmail').textContent = user.email;
        document.getElementById('uPhone').textContent = user.number;
        document.getElementById('uDept').textContent = user.department;

        // Load User Complaints
        const complaints = await apiRequest(`/User/${id}/complaints`);
        renderComplaints(complaints);

        content.style.display = 'block';
    } catch (error) {
        errorState.style.display = 'block';
        showToast('Failed to load user details', 'error');
    } finally {
        loader.style.display = 'none';
    }
}

function renderComplaints(complaints) {
    const tbody = document.getElementById('userComplaintsBody');
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
                <td>${complaint.technician ? `<a href="technician-details.html?id=${complaint.technician.id}" style="text-decoration:none; color:var(--primary-color);">${complaint.technician.name}</a>` : 'N/A'}</td>
                <td>${formatDate(complaint.createdDate)}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}
