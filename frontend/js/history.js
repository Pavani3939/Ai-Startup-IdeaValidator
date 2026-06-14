const API_BASE_URL = 'http://localhost:8080/api';

const themeToggle = document.getElementById('theme-toggle');
const historyGrid = document.getElementById('history-grid');
const historyLoading = document.getElementById('history-loading');
const emptyState = document.getElementById('empty-state');
const pagination = document.getElementById('pagination');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

let currentPage = 0;
let totalPages = 0;
const pageSize = 9; // 3x3 grid

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.body.removeAttribute('data-theme');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

themeToggle.addEventListener('click', () => {
    if (document.body.getAttribute('data-theme') === 'dark') {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
});

// Fetch History
async function fetchHistory() {
    historyLoading.classList.remove('hidden');
    historyGrid.classList.add('hidden');
    emptyState.classList.add('hidden');
    pagination.classList.add('hidden');

    try {
        const sortValue = sortSelect.value;
        
        // FAKE HISTORY DATA
        const fakeData = {
            content: [
                { id: "1", title: "Eco Deliveries", industry: "Logistics", summary: "This is an excellent startup idea! Eco Deliveries addresses a clear pain point...", successScore: 8, createdAt: new Date().toISOString() },
                { id: "2", title: "AI Legal Assistant", industry: "LegalTech", summary: "Strong potential. However, regulatory hurdles in the LegalTech industry...", successScore: 6, createdAt: new Date(Date.now() - 86400000).toISOString() },
                { id: "3", title: "VR Fitness Studio", industry: "Health & Wellness", summary: "A very trendy idea with high customer acquisition cost but strong retention...", successScore: 7, createdAt: new Date(Date.now() - 172800000).toISOString() }
            ],
            totalPages: 1,
            totalElements: 3
        };
        
        let items = fakeData.content;
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm) {
            items = items.filter(item => 
                item.title.toLowerCase().includes(searchTerm) || 
                item.industry.toLowerCase().includes(searchTerm)
            );
        }

        setTimeout(() => {
            renderHistory(items);
            totalPages = fakeData.totalPages;
            updatePagination(fakeData.totalElements);
        }, 500);
        
    } catch (error) {
        console.error(error);
        historyLoading.classList.add('hidden');
        emptyState.classList.remove('hidden');
    }
}

function renderHistory(items) {
    historyLoading.classList.add('hidden');
    
    if (items.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    historyGrid.classList.remove('hidden');
    historyGrid.innerHTML = '';

    items.forEach(item => {
        const date = new Date(item.createdAt).toLocaleDateString();
        
        const card = document.createElement('div');
        card.className = 'history-card fade-in';
        card.innerHTML = `
            <div class="history-card-header">
                <div class="history-card-title">${item.title}</div>
                <div class="history-card-badge">${item.successScore}/10</div>
            </div>
            <div class="text-muted" style="font-size: 0.8rem; margin-bottom: 0.5rem;">
                <i class="fa-solid fa-tag"></i> ${item.industry} &nbsp;&bull;&nbsp; <i class="fa-regular fa-calendar"></i> ${date}
            </div>
            <div class="history-card-desc">${item.summary}</div>
            <div class="history-card-footer">
                <button class="btn btn-secondary view-btn" style="padding: 0.4rem 0.8rem; font-size: 0.9rem;" data-id="${item.id}">
                    <i class="fa-solid fa-eye"></i> View PDF
                </button>
            </div>
        `;
        historyGrid.appendChild(card);
    });

    // Removed View PDF buttons since backend is mocked
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.style.display = 'none';
    });
}

function updatePagination(totalElements) {
    if (totalElements > 0) {
        pagination.classList.remove('hidden');
        pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
        
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage >= totalPages - 1;
    }
}

// Event Listeners
prevBtn.addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        fetchHistory();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages - 1) {
        currentPage++;
        fetchHistory();
    }
});

sortSelect.addEventListener('change', () => {
    currentPage = 0;
    fetchHistory();
});

let searchTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        // Since we are filtering client side for now in fetchHistory, just re-render
        fetchHistory();
    }, 300);
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    fetchHistory();
});
