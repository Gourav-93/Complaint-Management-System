document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
});

async function loadDashboardData() {
    const loader = document.getElementById('dashboardLoader');
    const content = document.getElementById('dashboardContent');

    try {
        loader.style.display = 'flex';
        content.style.display = 'none';

        const stats = await apiRequest('/Dashboard/statistics');
        
        // Update Stats Values
        document.getElementById('statTotalComplaints').textContent = stats.totalComplaints;
        document.getElementById('statPending').textContent = stats.pendingComplaints;
        document.getElementById('statInProgress').textContent = stats.inProgressComplaints;
        document.getElementById('statResolved').textContent = stats.resolvedComplaints;
        document.getElementById('statHighPriority').textContent = stats.highPriorityComplaints;
        document.getElementById('statUsers').textContent = stats.totalUsers;
        document.getElementById('statTechnicians').textContent = stats.totalTechnicians;

        // Render CSS Charts
        renderStatusChart(stats);
        renderOverviewChart(stats);

        content.style.display = 'block';
    } catch (error) {
        showToast('Failed to load dashboard data', 'error');
    } finally {
        loader.style.display = 'none';
    }
}

function renderStatusChart(stats) {
    const container = document.getElementById('statusChart');
    const maxVal = Math.max(stats.pendingComplaints, stats.inProgressComplaints, stats.resolvedComplaints, 1);
    
    const items = [
        { label: 'Pending', value: stats.pendingComplaints, color: 'var(--warning-color)' },
        { label: 'In Progress', value: stats.inProgressComplaints, color: '#0ea5e9' },
        { label: 'Resolved', value: stats.resolvedComplaints, color: 'var(--success-color)' }
    ];

    container.innerHTML = items.map(item => {
        const heightPercent = (item.value / maxVal) * 100;
        return `
            <div class="bar-container">
                <div class="bar" style="height: 0%; background-color: ${item.color}" data-height="${heightPercent}%">
                    <div class="bar-value">${item.value}</div>
                </div>
                <div class="bar-label">${item.label}</div>
            </div>
        `;
    }).join('');

    // Animate bars
    setTimeout(() => {
        container.querySelectorAll('.bar').forEach(bar => {
            bar.style.height = bar.getAttribute('data-height');
        });
    }, 100);
}

function renderOverviewChart(stats) {
    const container = document.getElementById('overviewChart');
    const maxVal = Math.max(stats.totalComplaints, stats.totalUsers, stats.totalTechnicians, 1);
    
    const items = [
        { label: 'Complaints', value: stats.totalComplaints, color: 'var(--primary-color)' },
        { label: 'Users', value: stats.totalUsers, color: '#8b5cf6' },
        { label: 'Technicians', value: stats.totalTechnicians, color: '#f43f5e' }
    ];

    container.innerHTML = items.map(item => {
        const heightPercent = (item.value / maxVal) * 100;
        return `
            <div class="bar-container">
                <div class="bar" style="height: 0%; background-color: ${item.color}" data-height="${heightPercent}%">
                    <div class="bar-value">${item.value}</div>
                </div>
                <div class="bar-label">${item.label}</div>
            </div>
        `;
    }).join('');

    // Animate bars
    setTimeout(() => {
        container.querySelectorAll('.bar').forEach(bar => {
            bar.style.height = bar.getAttribute('data-height');
        });
    }, 100);
}
