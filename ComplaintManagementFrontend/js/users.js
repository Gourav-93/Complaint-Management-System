let allUsers = [];

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});

async function loadUsers() {
    const loader = document.getElementById('tableLoader');
    const content = document.getElementById('tableContent');

    try {
        loader.style.display = 'flex';
        content.style.display = 'none';

        allUsers = await apiRequest('/User');
        renderTable(allUsers);

        content.style.display = 'block';
    } catch (error) {
        showToast('Failed to load users', 'error');
    } finally {
        loader.style.display = 'none';
    }
}



function renderTable(users) {
    const tbody = document.getElementById('usersTableBody');
    const emptyState = document.getElementById('emptyState');
    tbody.innerHTML = '';

    if (users.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${user.id}</td>
                <td style="font-weight: 500;">${user.name}</td>
                <td>${user.email}</td>
                <td>${user.number}</td>
                <td>${user.department}</td>
                <td>
                    <div class="table-actions">
                        <a href="user-details.html?id=${user.id}" class="btn btn-sm btn-outline" title="View">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </a>
                        <button class="btn btn-sm btn-outline" onclick="openEditModal(${user.id})" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})" title="Delete">
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
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('modalTitle').textContent = 'Add User';
    
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    document.querySelectorAll('.error-text').forEach(el => el.style.display = 'none');
}

function openCreateModal() {
    resetForm();
    openModal('userModal');
}

async function openEditModal(id) {
    resetForm();
    document.getElementById('modalTitle').textContent = 'Edit User';
    
    try {
        const user = await apiRequest(`/User/${id}`);
        document.getElementById('userId').value = user.id;
        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;
        document.getElementById('number').value = user.number;
        document.getElementById('department').value = user.department;
        
        openModal('userModal');
    } catch (error) {
        showToast('Failed to load user details', 'error');
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm() {
    let isValid = true;
    const fields = ['name', 'email', 'number', 'department'];
    
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

async function saveUser() {
    if (!validateForm()) return;
    
    const id = document.getElementById('userId').value;
    const isEdit = !!id;
    
    const payload = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        number: document.getElementById('number').value.trim(),
        department: document.getElementById('department').value.trim()
    };

    if (isEdit) payload.id = parseInt(id);

    const btn = document.getElementById('btnSaveUser');
    setButtonLoading(btn, true, 'Save User');

    try {
        if (isEdit) {
            await apiRequest(`/User/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            showToast('User updated successfully');
        } else {
            await apiRequest('/User', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            showToast('User created successfully');
        }
        
        closeModal('userModal');
        loadUsers();
    } catch (error) {
        showToast(isEdit ? 'Failed to update user' : 'Failed to create user', 'error');
    } finally {
        setButtonLoading(btn, false, 'Save User');
    }
}

function deleteUser(id) {
    showDeleteConfirmation('Are you sure you want to delete this user? All their complaints may be affected.', async () => {
        try {
            await apiRequest(`/User/${id}`, { method: 'DELETE' });
            showToast('User deleted successfully');
            loadUsers();
        } catch (error) {
            showToast('Failed to delete user', 'error');
            throw error;
        }
    });
}
