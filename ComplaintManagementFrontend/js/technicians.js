let allTechnicians = [];

document.addEventListener('DOMContentLoaded', () => {
    loadTechnicians();
    
    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterTechnicians(e.target.value);
    });
});

async function loadTechnicians() {
    const loader = document.getElementById('tableLoader');
    const content = document.getElementById('tableContent');

    try {
        loader.style.display = 'flex';
        content.style.display = 'none';

        allTechnicians = await apiRequest('/Technician');
        filterTechnicians(document.getElementById('searchInput').value);

        content.style.display = 'block';
    } catch (error) {
        showToast('Failed to load technicians', 'error');
    } finally {
        loader.style.display = 'none';
    }
}

function filterTechnicians(query) {
    const term = query.toLowerCase().trim();
    const filtered = allTechnicians.filter(t => 
        (t.name && t.name.toLowerCase().includes(term)) ||
        (t.email && t.email.toLowerCase().includes(term)) ||
        (t.specialization && t.specialization.toLowerCase().includes(term))
    );
    renderTable(filtered);
}

function renderTable(technicians) {
    const tbody = document.getElementById('techniciansTableBody');
    const emptyState = document.getElementById('emptyState');
    tbody.innerHTML = '';

    if (technicians.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        technicians.forEach(tech => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${tech.id}</td>
                <td style="font-weight: 500;">${tech.name}</td>
                <td>${tech.email}</td>
                <td>${tech.specialization}</td>
                <td>${tech.department}</td>
                <td>
                    <div class="table-actions">
                        <a href="technician-details.html?id=${tech.id}" class="btn btn-sm btn-outline" title="View">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </a>
                        <button class="btn btn-sm btn-outline" onclick="openEditModal(${tech.id})" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteTechnician(${tech.id})" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function resetForm() {
    document.getElementById('technicianForm').reset();
    document.getElementById('technicianId').value = '';
    document.getElementById('modalTitle').textContent = 'Add Technician';
    
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    document.querySelectorAll('.error-text').forEach(el => el.style.display = 'none');
}

function openCreateModal() {
    resetForm();
    openModal('technicianModal');
}

async function openEditModal(id) {
    resetForm();
    document.getElementById('modalTitle').textContent = 'Edit Technician';
    
    try {
        const tech = await apiRequest(`/Technician/${id}`);
        document.getElementById('technicianId').value = tech.id;
        document.getElementById('name').value = tech.name;
        document.getElementById('email').value = tech.email;
        document.getElementById('specialization').value = tech.specialization;
        document.getElementById('department').value = tech.department;
        
        openModal('technicianModal');
    } catch (error) {
        showToast('Failed to load technician details', 'error');
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm() {
    let isValid = true;
    const fields = ['name', 'email', 'specialization', 'department'];
    
    fields.forEach(field => {
        const el = document.getElementById(field);
        const errorText = el.nextElementSibling;
        
        if (!el.value.trim() || (field === 'email' && !validateEmail(el.value))) {
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

async function saveTechnician() {
    if (!validateForm()) return;
    
    const id = document.getElementById('technicianId').value;
    const isEdit = !!id;
    
    const payload = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        specialization: document.getElementById('specialization').value.trim(),
        department: document.getElementById('department').value.trim()
    };

    if (isEdit) payload.id = parseInt(id);

    const btn = document.getElementById('btnSaveTechnician');
    setButtonLoading(btn, true, 'Save Technician');

    try {
        if (isEdit) {
            await apiRequest(`/Technician/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            showToast('Technician updated successfully');
        } else {
            await apiRequest('/Technician', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            showToast('Technician created successfully');
        }
        
        closeModal('technicianModal');
        loadTechnicians();
    } catch (error) {
        showToast(isEdit ? 'Failed to update technician' : 'Failed to create technician', 'error');
    } finally {
        setButtonLoading(btn, false, 'Save Technician');
    }
}

function deleteTechnician(id) {
    showDeleteConfirmation('Are you sure you want to delete this technician? All their complaints may be affected.', async () => {
        try {
            await apiRequest(`/Technician/${id}`, { method: 'DELETE' });
            showToast('Technician deleted successfully');
            loadTechnicians();
        } catch (error) {
            showToast('Failed to delete technician', 'error');
            throw error;
        }
    });
}
