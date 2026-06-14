const API_BASE_URL = 'http://localhost:8080/api';

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const ideaForm = document.getElementById('idea-form');
const titleInput = document.getElementById('title');
const industrySelect = document.getElementById('industry');
const descriptionInput = document.getElementById('description');
const charCurrent = document.getElementById('char-current');
const resetBtn = document.getElementById('reset-btn');
const analyzeBtn = document.getElementById('analyze-btn');

const inputSection = document.getElementById('input-section');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');

const newAnalysisBtn = document.getElementById('new-analysis-btn');
const downloadPdfBtn = document.getElementById('download-pdf-btn');

// State
let currentReportId = null;

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

// Character Count
if (descriptionInput) {
    descriptionInput.addEventListener('input', () => {
        const length = descriptionInput.value.length;
        charCurrent.textContent = length;
        if (length > 900) {
            charCurrent.style.color = 'var(--danger-color)';
        } else {
            charCurrent.style.color = 'var(--text-muted)';
        }
    });
}

// Validation
function validateForm() {
    let isValid = true;
    
    // Title
    if (!titleInput.value.trim()) {
        document.getElementById('title-error').textContent = 'Title is required';
        isValid = false;
    } else {
        document.getElementById('title-error').textContent = '';
    }

    // Industry
    if (!industrySelect.value) {
        document.getElementById('industry-error').textContent = 'Industry is required';
        isValid = false;
    } else {
        document.getElementById('industry-error').textContent = '';
    }

    // Description
    if (!descriptionInput.value.trim() || descriptionInput.value.length < 20) {
        document.getElementById('description-error').textContent = 'Description is required and should be at least 20 characters';
        isValid = false;
    } else {
        document.getElementById('description-error').textContent = '';
    }

    return isValid;
}

// Submit Form
if (ideaForm) {
    ideaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        const payload = {
            title: titleInput.value.trim(),
            industry: industrySelect.value,
            description: descriptionInput.value.trim()
        };

        // UI Transition
        inputSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');

        // Simulate Network Delay and AI Processing (2.5 seconds)
        setTimeout(() => {
            const data = {
                id: Date.now().toString(),
                summary: "This is an excellent startup idea! " + payload.title + " addresses a clear pain point in the " + payload.industry + " industry. The approach described (" + payload.description.substring(0, 50) + "...) shows strong potential for disruption by utilizing modern technology to solve traditional problems.",
                advantages: [
                    "High demand in the current market for " + payload.industry + " solutions.",
                    "Scalable business model.",
                    "Clear target audience and value proposition."
                ],
                disadvantages: [
                    "Potential high initial customer acquisition cost.",
                    "Possible regulatory hurdles depending on the region.",
                    "Strong competition from established players."
                ],
                marketPotential: "The " + payload.industry + " market is growing at a rapid pace. If " + payload.title + " can capture even a 1% market share in the first two years, it could lead to multi-million dollar recurring revenue.",
                suggestions: [
                    "Focus heavily on building a strong MVP before seeking large funding.",
                    "Partner with existing local businesses to reduce customer acquisition costs.",
                    "Implement a freemium model to drive early user adoption."
                ],
                successScore: 8
            };
            
            currentReportId = data.id;
            displayResults(data);
        }, 2500);
    });
}

function displayResults(data) {
    loadingSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');

    // Setup Score Meter
    const scoreText = document.getElementById('score-text');
    const scorePath = document.getElementById('score-path');
    
    scoreText.textContent = data.successScore;
    
    // Calculate stroke dasharray for circle (circumference is 100 in relative units for this svg setup)
    const strokeValue = (data.successScore / 10) * 100;
    setTimeout(() => {
        scorePath.setAttribute('stroke-dasharray', `${strokeValue}, 100`);
        // Color coding score
        if (data.successScore >= 8) scorePath.style.stroke = 'var(--success-color)';
        else if (data.successScore >= 5) scorePath.style.stroke = 'var(--warning-color)';
        else scorePath.style.stroke = 'var(--danger-color)';
    }, 100);

    // Text fields
    document.getElementById('res-summary').textContent = data.summary;
    document.getElementById('res-market').textContent = data.marketPotential;

    // Lists
    populateList('res-advantages', data.advantages);
    populateList('res-disadvantages', data.disadvantages);
    populateList('res-suggestions', data.suggestions);
}

function populateList(elementId, items) {
    const ul = document.getElementById(elementId);
    ul.innerHTML = '';
    if (items && items.length > 0) {
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            ul.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = "None identified.";
        li.style.color = "var(--text-muted)";
        ul.appendChild(li);
    }
}

// Reset
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        ideaForm.reset();
        charCurrent.textContent = '0';
        document.querySelectorAll('.error').forEach(e => e.textContent = '');
    });
}

// New Analysis
if (newAnalysisBtn) {
    newAnalysisBtn.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        ideaForm.reset();
        charCurrent.textContent = '0';
        inputSection.classList.remove('hidden');
        document.getElementById('score-path').setAttribute('stroke-dasharray', '0, 100');
    });
}

// Download PDF (Removed as it requires backend)
if (downloadPdfBtn) {
    downloadPdfBtn.style.display = 'none';
}

// Initialization
document.addEventListener('DOMContentLoaded', initTheme);
