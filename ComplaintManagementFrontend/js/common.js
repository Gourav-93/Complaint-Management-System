// DOM Elements
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.querySelector('.menu-toggle');
const currentDateEl = document.querySelector('.current-date');
const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
document.body.appendChild(toastContainer);

// Initialize Common Features
document.addEventListener('DOMContentLoaded', () => {
    // Current Date
    if (currentDateEl) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // Mobile Menu Toggle
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // Close modals on clicking overlay or close button
    const modals = document.querySelectorAll('.modal-overlay');
    const closeBtns = document.querySelectorAll('.modal-close, [data-dismiss="modal"]');

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) closeModal(modal.id);
        });
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
});

/**
 * Show a toast notification
 * @param {string} message 
 * @param {'success' | 'error'} type 
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon based on type
    const icon = type === 'success' 
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

    toast.innerHTML = `
        ${icon}
        <div class="toast-message">${message}</div>
    `;

    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Show Modal
 * @param {string} modalId 
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Hide Modal
 * @param {string} modalId 
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Set loading state for a button
 * @param {HTMLButtonElement} button 
 * @param {boolean} isLoading 
 * @param {string} originalText 
 */
function setButtonLoading(button, isLoading, originalText = 'Save') {
    if (!button) return;
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="loader"></span> Loading...';
    } else {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

/**
 * Format date for display
 * @param {string} dateString 
 * @returns {string}
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get CSS class for status badge
 * @param {string} status 
 * @returns {string}
 */
function getStatusBadgeClass(status) {
    switch ((status || '').toLowerCase()) {
        case 'pending': return 'badge badge-pending';
        case 'in progress': return 'badge badge-in-progress';
        case 'resolved': return 'badge badge-resolved';
        default: return 'badge badge-low'; // default
    }
}

/**
 * Get CSS class for priority badge
 * @param {string} priority 
 * @returns {string}
 */
function getPriorityBadgeClass(priority) {
    switch ((priority || '').toLowerCase()) {
        case 'high': return 'badge badge-high';
        case 'medium': return 'badge badge-medium';
        case 'low': return 'badge badge-low';
        default: return 'badge badge-low';
    }
}

/**
 * Delete Confirmation Dialog Logic
 */
let pendingDeleteCallback = null;

function showDeleteConfirmation(message, onConfirm) {
    pendingDeleteCallback = onConfirm;
    
    // Check if modal exists
    let modal = document.getElementById('deleteConfirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'deleteConfirmModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Confirm Delete</h3>
                    <button class="modal-close" data-dismiss="modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p id="deleteConfirmMessage">${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button class="btn btn-danger" id="btnConfirmDelete">Delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('[data-dismiss="modal"]').addEventListener('click', () => closeModal('deleteConfirmModal'));
        modal.querySelector('.modal-close').addEventListener('click', () => closeModal('deleteConfirmModal'));
        
        modal.querySelector('#btnConfirmDelete').addEventListener('click', async () => {
            const btn = document.getElementById('btnConfirmDelete');
            setButtonLoading(btn, true, 'Delete');
            try {
                if (pendingDeleteCallback) await pendingDeleteCallback();
                closeModal('deleteConfirmModal');
            } catch(e) {
                // Error handled in callback
            } finally {
                setButtonLoading(btn, false, 'Delete');
            }
        });
    } else {
        document.getElementById('deleteConfirmMessage').textContent = message;
    }
    
    openModal('deleteConfirmModal');
}
