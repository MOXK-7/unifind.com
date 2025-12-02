import { auth, onAuthStateChanged } from './auth-service.js';

const questions = [
    // --- 1. ENGINEERING / TECH ---
    {
        question: "What subjects do you enjoy the most?",
        options: [
            { text: "Math & Physics", type: "Eng" },
            { text: "Biology & Chemistry", type: "Med" },
            { text: "History & Languages", type: "Arts" },
            { text: "Economics & Business", type: "Bus" }
        ]
    },
    {
        question: "How do you prefer to work?",
        options: [
            { text: "Building or fixing things", type: "Eng" },
            { text: "Helping people directly", type: "Med" },
            { text: "Analyzing data & trends", type: "Bus" },
            { text: "Creative writing or design", type: "Arts" }
        ]
    },
    {
        question: "What's your ideal work environment?",
        options: [
            { text: "Construction Site or Tech Lab", type: "Eng" },
            { text: "Laboratory or Hospital", type: "Med" },
            { text: "Corporate Office", type: "Bus" },
            { text: "Studio or Flexible Remote", type: "Arts" }
        ]
    },
    {
        question: "Which TV show character do you relate to?",
        options: [
            { text: "The Innovator / Tech Genius", type: "Eng" },
            { text: "The Doctor / Healer", type: "Med" },
            { text: "The CEO / Leader", type: "Bus" },
            { text: "The Artist / Writer", type: "Arts" }
        ]
    },
    {
        question: "Pick a problem to solve:",
        options: [
            { text: "Designing a sustainable city", type: "Eng" },
            { text: "Curing a disease", type: "Med" },
            { text: "Launching a startup", type: "Bus" },
            { text: "Creating a viral campaign", type: "Arts" }
        ]
    },
    // --- 2. NEW QUESTIONS (6-10) ---
    {
        question: "What comes naturally to you?",
        options: [
            { text: "Understanding machines", type: "Eng" },
            { text: "Empathizing with others", type: "Med" },
            { text: "Spotting opportunities", type: "Bus" },
            { text: "Visualizing colors/shapes", type: "Arts" }
        ]
    },
    {
        question: "If you started a club, what would it be?",
        options: [
            { text: "Robotics / Coding", type: "Eng" },
            { text: "First Aid / Volunteer", type: "Med" },
            { text: "Investment / Debate", type: "Bus" },
            { text: "Drama / Photography", type: "Arts" }
        ]
    },
    {
        question: "What do you like to read?",
        options: [
            { text: "Sci-Fi or Tech News", type: "Eng" },
            { text: "Health & Biology", type: "Med" },
            { text: "Market Trends / News", type: "Bus" },
            { text: "Fiction / Philosophy", type: "Arts" }
        ]
    },
    {
        question: "Which tool would you rather use?",
        options: [
            { text: "3D Printer / Tools", type: "Eng" },
            { text: "Microscope / Stethoscope", type: "Med" },
            { text: "Spreadsheet / Planner", type: "Bus" },
            { text: "Camera / Paintbrush", type: "Arts" }
        ]
    },
    {
        question: "What is your ultimate goal?",
        options: [
            { text: "Inventing something new", type: "Eng" },
            { text: "Saving lives", type: "Med" },
            { text: "Building a business empire", type: "Bus" },
            { text: "Inspiring others", type: "Arts" }
        ]
    }
];

let currentStep = 0;
let scores = { Eng: 0, Med: 0, Bus: 0, Arts: 0 };
let currentUserEmail = "guest@example.com";

// DOM Elements
const wrapper = document.getElementById('questionsWrapper');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const progressBar = document.getElementById('progressBar');
const quizForm = document.getElementById('quizForm');
const loadingState = document.getElementById('loadingState');
const resultState = document.getElementById('resultState');
const userEmailDisplay = document.getElementById('userEmailDisplay');
const recommendedCareer = document.getElementById('recommendedCareer');

// Auth Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserEmail = user.email;
    }
});

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    initQuiz();
    
    // Global Event Listeners
    nextBtn.addEventListener('click', nextStep);
    prevBtn.addEventListener('click', prevStep);

    // Event Delegation for Options
    wrapper.addEventListener('click', (e) => {
        if (e.target.classList.contains('option-btn')) {
            const btn = e.target;
            const type = btn.dataset.type;
            selectOption(btn, type);
        }
    });
});

function initQuiz() {
    renderQuestions();
    showStep(0);
}

function renderQuestions() {
    wrapper.innerHTML = questions.map((q, index) => `
        <div class="question-card" data-step="${index}">
            <div class="question-text">${index + 1}. ${q.question}</div>
            <div class="options-grid">
                ${q.options.map(opt => `
                    <button class="option-btn" data-type="${opt.type}">
                        ${opt.text}
                    </button>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function selectOption(btn, type) {
    // Visual Selection
    const parent = btn.parentElement;
    Array.from(parent.children).forEach(child => child.classList.remove('selected'));
    btn.classList.add('selected');

    // Auto advance
    setTimeout(() => {
        if (currentStep < questions.length - 1) {
            nextStep();
        } else {
            // If it's the last question, we manually trigger the nextStep to submit
            nextStep(); 
        }
    }, 300);
}

function showStep(index) {
    document.querySelectorAll('.question-card').forEach((card, i) => {
        card.classList.toggle('active', i === index);
    });
    
    // Progress Bar: 0% at Q1, 90% at Q10. The last 10% happens on Submit.
    const progress = (index / questions.length) * 100;
    progressBar.style.width = `${progress}%`;

    // Buttons
    prevBtn.disabled = index === 0;
    nextBtn.textContent = index === questions.length - 1 ? 'Submit Quiz' : 'Next';
    currentStep = index;
}

function nextStep() {
    // Validate selection
    const activeCard = document.querySelector(`.question-card[data-step="${currentStep}"]`);
    const selected = activeCard.querySelector('.selected');
    
    if (!selected) {
        alert("Please select an option.");
        return;
    }

    // Add to score
    const type = selected.dataset.type;
    scores[type]++; 

    if (currentStep < questions.length - 1) {
        showStep(currentStep + 1);
    } else {
        submitQuiz();
    }
}

function prevStep() {
    if (currentStep > 0) showStep(currentStep - 1);
}

function submitQuiz() {
    // 1. Calculate Winner
    const winner = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    let careerName = "General Studies";
    if (winner === 'Eng') careerName = "Engineering & Technology";
    if (winner === 'Med') careerName = "Medicine & Health Sciences";
    if (winner === 'Bus') careerName = "Business & Management";
    if (winner === 'Arts') careerName = "Arts & Humanities";

    // 2. VISUAL FIX: Set bar to 100% immediately
    progressBar.style.width = '100%';

    // 3. Delay hiding the form so the user SEES the bar hit 100%
    setTimeout(() => {
        quizForm.style.display = 'none';
        loadingState.style.display = 'block';

        // 4. Simulate API Call
        setTimeout(() => {
            loadingState.style.display = 'none';
            resultState.style.display = 'block';
            
            userEmailDisplay.textContent = currentUserEmail;
            recommendedCareer.textContent = careerName;
            
            console.log(`Quiz Result: ${careerName} for ${currentUserEmail}`);
        }, 2000);
        
    }, 600); // 600ms delay to allow the bar transition to complete visually
}