const API_BASE_URL = 'https://ai-startup-ideavalidator.onrender.com/api';

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

        try {
            const response = await fetch(`${API_BASE_URL}/ideas/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to analyze the startup idea. Please try again.');
            }

            const data = await response.json();
            currentReportId = data.id;
            displayResults(data);
        } catch (error) {
            console.error('Error analyzing idea:', error);
            alert(error.message || 'An error occurred while analyzing the idea.');
            // Go back to input section
            loadingSection.classList.add('hidden');
            inputSection.classList.remove('hidden');
        }
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

// Download PDF
if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
        if (currentReportId) {
            window.location.href = `${API_BASE_URL}/reports/${currentReportId}/pdf`;
        }
    });
}

// Initialization
document.addEventListener('DOMContentLoaded', initTheme);
