let debounceTimeout;

document.addEventListener('DOMContentLoaded', () => {
    loadComplaints();
    
    // Attach event listeners for search/filters
    const searchInput = document.getElementById('searchInput');
    const filterStatus = document.getElementById('filterStatus');
    const filterPriority = document.getElementById('filterPriority');
    const filterCategory = document.getElementById('filterCategory');

    searchInput.addEventListener('input', () => debounceSearch());
    filterCategory.addEventListener('input', () => debounceSearch());
    filterStatus.addEventListener('change', () => { loadComplaints(); });
    filterPriority.addEventListener('change', () => { loadComplaints(); });
});

function debounceSearch() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        loadComplaints();
    }, 500);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterPriority').value = '';
    document.getElementById('filterCategory').value = '';
    loadComplaints();
}

async function loadComplaints() {
    const loader = document.getElementById('tableLoader');
    const content = document.getElementById('tableContent');
    const emptyState = document.getElementById('emptyState');
    const tableBody = document.getElementById('complaintsTableBody');

    try {
        if (!tableBody.innerHTML) {
            loader.style.display = 'flex';
            content.style.display = 'none';
        }

        const search = document.getElementById('searchInput').value;
        const status = document.getElementById('filterStatus').value;
        const priority = document.getElementById('filterPriority').value;
        const category = document.getElementById('filterCategory').value;

        let query = `/Complaint/search?`;
        const params = [];
        if (search) params.push(`search=${encodeURIComponent(search)}`);
        if (status) params.push(`status=${encodeURIComponent(status)}`);
        if (priority) params.push(`priority=${encodeURIComponent(priority)}`);
        if (category) params.push(`category=${encodeURIComponent(category)}`);
        
        query += params.join('&');

        const response = await apiRequest(query);

        renderTable(response.data);

        emptyState.style.display = response.data.length === 0 ? 'block' : 'none';
        content.style.display = 'block';
    } catch (error) {
        showToast('Failed to load complaints', 'error');
    } finally {
        loader.style.display = 'none';
    }
}

function renderTable(complaints) {
    const tbody = document.getElementById('complaintsTableBody');
    tbody.innerHTML = '';

    complaints.forEach(complaint => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${complaint.id}</td>
            <td style="font-weight: 500;">${complaint.title}</td>
            <td>${complaint.category}</td>
            <td><span class="${getPriorityBadgeClass(complaint.priority)}">${complaint.priority}</span></td>
            <td><span class="${getStatusBadgeClass(complaint.status)}">${complaint.status}</span></td>
            <td>${complaint.user?.name || 'N/A'}</td>
            <td>${complaint.technician?.name || 'N/A'}</td>
            <td>${formatDate(complaint.createdDate)}</td>
            <td>
                <div class="table-actions">
                    <a href="complaint-details.html?id=${complaint.id}" class="btn btn-sm btn-outline" title="View">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </a>
                    <button class="btn btn-sm btn-outline" onclick="openEditModal(${complaint.id})" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteComplaint(${complaint.id})" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}



// Modal Logic
let usersLoaded = false;
let techniciansLoaded = false;

async function loadDropdowns() {
    try {
        if (!usersLoaded) {
            const users = await apiRequest('/User');
            const select = document.getElementById('userId');
            select.innerHTML = '<option value="">Select User</option>' + 
                users.map(u => `<option value="${u.id}">${u.name} - ${u.department}</option>`).join('');
            usersLoaded = true;
        }
        
        if (!techniciansLoaded) {
            const techs = await apiRequest('/Technician');
            const select = document.getElementById('technicianId');
            select.innerHTML = '<option value="">Select Technician</option>' + 
                techs.map(t => `<option value="${t.id}">${t.name} - ${t.specialization}</option>`).join('');
            techniciansLoaded = true;
        }
    } catch (error) {
        showToast('Failed to load dropdown data', 'error');
    }
}

function resetForm() {
    document.getElementById('complaintForm').reset();
    document.getElementById('complaintId').value = '';
    document.getElementById('modalTitle').textContent = 'Create Complaint';
    
    // Remove validation errors
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    document.querySelectorAll('.error-text').forEach(el => el.style.display = 'none');
}

async function openCreateModal() {
    resetForm();
    await loadDropdowns();
    openModal('complaintModal');
}

async function openEditModal(id) {
    resetForm();
    document.getElementById('modalTitle').textContent = 'Edit Complaint';
    await loadDropdowns();
    
    try {
        const complaint = await apiRequest(`/Complaint/${id}`);
        document.getElementById('complaintId').value = complaint.id;
        document.getElementById('title').value = complaint.title;
        document.getElementById('description').value = complaint.description;
        document.getElementById('category').value = complaint.category;
        document.getElementById('priority').value = complaint.priority;
        document.getElementById('status').value = complaint.status;
        document.getElementById('userId').value = complaint.userId;
        document.getElementById('technicianId').value = complaint.technicianId;
        
        openModal('complaintModal');
    } catch (error) {
        showToast('Failed to load complaint details', 'error');
    }
}

function validateForm() {
    let isValid = true;
    const fields = ['title', 'description', 'category', 'priority', 'status', 'userId', 'technicianId'];
    
    fields.forEach(field => {
        const el = document.getElementById(field);
        const errorText = el.nextElementSibling;
        if (!el.value.trim()) {
            el.classList.add('is-invalid');
            if (errorText) errorText.style.display = 'block';
            isValid = false;
        } else {
            el.classList.remove('is-invalid');
            if (errorText) errorText.style.display = 'none';
        }
    });
    
    return isValid;
}

async function saveComplaint() {
    if (!validateForm()) return;
    
    const id = document.getElementById('complaintId').value;
    const isEdit = !!id;
    
    const payload = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        priority: document.getElementById('priority').value,
        status: document.getElementById('status').value,
        userId: parseInt(document.getElementById('userId').value),
        technicianId: parseInt(document.getElementById('technicianId').value)
    };

    if (isEdit) {
        payload.id = parseInt(id);
    }

    const btn = document.getElementById('btnSaveComplaint');
    setButtonLoading(btn, true, 'Save Complaint');

    try {
        if (isEdit) {
            await apiRequest(`/Complaint/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            showToast('Complaint updated successfully');
        } else {
            await apiRequest('/Complaint', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            showToast('Complaint created successfully');
        }
        
        closeModal('complaintModal');
        loadComplaints();
    } catch (error) {
        showToast(isEdit ? 'Failed to update complaint' : 'Failed to create complaint', 'error');
    } finally {
        setButtonLoading(btn, false, 'Save Complaint');
    }
}

function deleteComplaint(id) {
    showDeleteConfirmation('Are you sure you want to delete this complaint? This action cannot be undone.', async () => {
        try {
            await apiRequest(`/Complaint/${id}`, { method: 'DELETE' });
            showToast('Complaint deleted successfully');
            loadComplaints();
        } catch (error) {
            showToast('Failed to delete complaint', 'error');
            throw error; // Re-throw to keep modal loading state if needed, or we close modal automatically in common.js
        }
    });
}
