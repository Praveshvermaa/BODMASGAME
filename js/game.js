/* =========================================
   BODMAS Express — Game Engine
   ========================================= */

// ---- Globals ----
let particles;
let gameState = {
    currentLevel: null,
    currentStepIndex: 0,
    score: 0,
    lives: 3,
    streak: 0,
    mistakes: 0,
    timeLeft: 60,
    timerInterval: null,
    isPaused: false,
    isPlaying: false,
    levelsData: [],
    highScores: {},
    totalStars: 0,
    levelsCompleted: 0,
};

const TYPE_NAMES = {
    B: 'Brackets',
    O: 'Orders',
    D: 'Division',
    M: 'Multiply',
    A: 'Addition',
    S: 'Subtract',
};

const BUS_EMOJIS = {
    purple: '🟣',
    red: '🔴',
    orange: '🟠',
    yellow: '🟡',
    green: '🟢',
    blue: '🔵',
};

// ---- Audio (Web Audio API minimal beeps) ----
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if (!audioCtx) audioCtx = new AudioCtx();
}

function playTone(freq, duration, type = 'sine', volume = 0.15) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function soundCorrect() {
    playTone(523, 0.15);
    setTimeout(() => playTone(659, 0.15), 100);
    setTimeout(() => playTone(784, 0.2), 200);
}

function soundWrong() {
    playTone(200, 0.3, 'sawtooth', 0.1);
}

function soundClick() {
    playTone(440, 0.05, 'sine', 0.08);
}

function soundLevelComplete() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => setTimeout(() => playTone(n, 0.25), i * 150));
}

function soundGameOver() {
    playTone(400, 0.3, 'sawtooth', 0.1);
    setTimeout(() => playTone(300, 0.3, 'sawtooth', 0.1), 200);
    setTimeout(() => playTone(200, 0.5, 'sawtooth', 0.1), 400);
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    particles = new ParticleSystem('particleCanvas');
    loadLevels();
    loadStats();
});

// ---- Storage Helper (localStorage fallback) ----
let useLocalStorage = false;

function localLoadStats() {
    try {
        const saved = localStorage.getItem('bodmas_stats');
        if (saved) {
            const data = JSON.parse(saved);
            gameState.highScores = data.highScores || {};
            gameState.totalStars = data.totalStars || 0;
            gameState.levelsCompleted = data.levelsCompleted || 0;
        }
    } catch (e) { /* ignore */ }
    updateStatsUI();
}

function localSaveScore(levelId, score, stars) {
    const existing = gameState.highScores[levelId] || 0;
    if (score > existing) {
        gameState.highScores[levelId] = score;
    }
    // Recalculate totals
    gameState.totalStars = 0;
    gameState.levelsCompleted = 0;
    for (const lid in gameState.highScores) {
        gameState.levelsCompleted++;
        const sc = gameState.highScores[lid];
        if (sc >= 250) gameState.totalStars += 3;
        else if (sc >= 150) gameState.totalStars += 2;
        else gameState.totalStars += 1;
    }
    try {
        localStorage.setItem('bodmas_stats', JSON.stringify({
            highScores: gameState.highScores,
            totalStars: gameState.totalStars,
            levelsCompleted: gameState.levelsCompleted,
        }));
    } catch (e) { /* ignore */ }
    updateStatsUI();
}

// ---- API Calls (PHP with localStorage fallback) ----
async function loadLevels() {
    try {
        const res = await fetch('php/api.php?action=levels');
        const data = await res.json();
        if (data.success) {
            gameState.levelsData = data.levels;
            renderLevelGrid();
            return;
        }
    } catch (e) {
        console.log('PHP not available, using built-in levels');
    }
    useLocalStorage = true;
    loadLevelsFallback();
}

async function loadStats() {
    if (useLocalStorage) {
        localLoadStats();
        return;
    }
    try {
        const res = await fetch('php/api.php?action=stats');
        const data = await res.json();
        if (data.success) {
            gameState.highScores = data.highScores || {};
            gameState.totalStars = data.totalStars || 0;
            gameState.levelsCompleted = data.levelsCompleted || 0;
            updateStatsUI();
            return;
        }
    } catch (e) {
        console.log('PHP stats unavailable, using localStorage');
    }
    useLocalStorage = true;
    localLoadStats();
}

async function saveScore(levelId, score, stars) {
    if (useLocalStorage) {
        localSaveScore(levelId, score, stars);
        return;
    }
    try {
        await fetch('php/api.php?action=save_score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ levelId, score, stars, playerName: 'Player' }),
        });
        await loadStats();
    } catch (e) {
        console.log('PHP save failed, using localStorage');
        useLocalStorage = true;
        localSaveScore(levelId, score, stars);
    }
}

// ---- Fallback Levels (if PHP not available) ----
function loadLevelsFallback() {
    gameState.levelsData = [
        {
            id: 1, title: 'First Stop', expression: '2 + 3 × 4', finalAnswer: 14, difficulty: 1, timeLimit: 60,
            hint: 'Remember: Multiplication comes before Addition!',
            steps: [
                { type: 'M', label: '3 × 4 = 12', busColor: 'yellow', description: 'Multiplication first!', resultExpression: '2 + 12' },
                { type: 'A', label: '2 + 12 = 14', busColor: 'green', description: 'Then addition', resultExpression: '14' },
            ],
        },
        {
            id: 2, title: 'Easy Route', expression: '20 − 8 ÷ 2', finalAnswer: 16, difficulty: 1, timeLimit: 60,
            hint: 'Division is higher priority than Subtraction!',
            steps: [
                { type: 'D', label: '8 ÷ 2 = 4', busColor: 'orange', description: 'Division first!', resultExpression: '20 − 4' },
                { type: 'S', label: '20 − 4 = 16', busColor: 'blue', description: 'Then subtraction', resultExpression: '16' },
            ],
        },
        {
            id: 3, title: 'Bracket Lane', expression: '(3 + 5) × 2', finalAnswer: 16, difficulty: 1, timeLimit: 60,
            hint: 'Always solve what\'s inside Brackets first!',
            steps: [
                { type: 'B', label: '(3 + 5) = 8', busColor: 'purple', description: 'Brackets first!', resultExpression: '8 × 2' },
                { type: 'M', label: '8 × 2 = 16', busColor: 'yellow', description: 'Then multiplication', resultExpression: '16' },
            ],
        },
        {
            id: 4, title: 'Cross Town', expression: '10 + 6 × 2 − 4', finalAnswer: 18, difficulty: 2, timeLimit: 55,
            hint: 'Do multiplication, then go left to right for + and −',
            steps: [
                { type: 'M', label: '6 × 2 = 12', busColor: 'yellow', description: 'Multiplication first!', resultExpression: '10 + 12 − 4' },
                { type: 'A', label: '10 + 12 = 22', busColor: 'green', description: 'Addition (left to right)', resultExpression: '22 − 4' },
                { type: 'S', label: '22 − 4 = 18', busColor: 'blue', description: 'Then subtraction', resultExpression: '18' },
            ],
        },
        {
            id: 5, title: 'Power Drive', expression: '3² + 4 × 2', finalAnswer: 17, difficulty: 2, timeLimit: 55,
            hint: 'Orders (powers/exponents) come right after Brackets!',
            steps: [
                { type: 'O', label: '3² = 9', busColor: 'red', description: 'Orders (powers) first!', resultExpression: '9 + 4 × 2' },
                { type: 'M', label: '4 × 2 = 8', busColor: 'yellow', description: 'Then multiplication', resultExpression: '9 + 8' },
                { type: 'A', label: '9 + 8 = 17', busColor: 'green', description: 'Finally addition', resultExpression: '17' },
            ],
        },
        {
            id: 6, title: 'Express Lane', expression: '(4 + 3) × (10 − 8)', finalAnswer: 14, difficulty: 3, timeLimit: 50,
            hint: 'Solve both brackets first, then multiply!',
            steps: [
                { type: 'B', label: '(4 + 3) = 7', busColor: 'purple', description: 'First bracket!', resultExpression: '7 × (10 − 8)' },
                { type: 'B', label: '(10 − 8) = 2', busColor: 'purple', description: 'Second bracket!', resultExpression: '7 × 2' },
                { type: 'M', label: '7 × 2 = 14', busColor: 'yellow', description: 'Then multiply', resultExpression: '14' },
            ],
        },
        {
            id: 7, title: 'Highway Run', expression: '(2 + 3)² − 5 × 3', finalAnswer: 10, difficulty: 3, timeLimit: 50,
            hint: 'B → O → M → S — follow the priority!',
            steps: [
                { type: 'B', label: '(2 + 3) = 5', busColor: 'purple', description: 'Brackets first!', resultExpression: '5² − 5 × 3' },
                { type: 'O', label: '5² = 25', busColor: 'red', description: 'Then orders!', resultExpression: '25 − 5 × 3' },
                { type: 'M', label: '5 × 3 = 15', busColor: 'yellow', description: 'Multiplication next', resultExpression: '25 − 15' },
                { type: 'S', label: '25 − 15 = 10', busColor: 'blue', description: 'Finally subtract', resultExpression: '10' },
            ],
        },
        {
            id: 8, title: 'City Circuit', expression: '48 ÷ (2 + 6) + 3²', finalAnswer: 15, difficulty: 4, timeLimit: 45,
            hint: 'Full BODMAS chain: Brackets → Orders → Division → Addition',
            steps: [
                { type: 'B', label: '(2 + 6) = 8', busColor: 'purple', description: 'Brackets first!', resultExpression: '48 ÷ 8 + 3²' },
                { type: 'O', label: '3² = 9', busColor: 'red', description: 'Orders next!', resultExpression: '48 ÷ 8 + 9' },
                { type: 'D', label: '48 ÷ 8 = 6', busColor: 'orange', description: 'Division before addition', resultExpression: '6 + 9' },
                { type: 'A', label: '6 + 9 = 15', busColor: 'green', description: 'Finally add', resultExpression: '15' },
            ],
        },
        {
            id: 9, title: 'Night Express', expression: '2 × (3 + (4 − 1)) + 6', finalAnswer: 18, difficulty: 4, timeLimit: 45,
            hint: 'Nested brackets? Solve the innermost first!',
            steps: [
                { type: 'B', label: '(4 − 1) = 3', busColor: 'purple', description: 'Inner brackets first!', resultExpression: '2 × (3 + 3) + 6' },
                { type: 'B', label: '(3 + 3) = 6', busColor: 'purple', description: 'Outer brackets next!', resultExpression: '2 × 6 + 6' },
                { type: 'M', label: '2 × 6 = 12', busColor: 'yellow', description: 'Multiplication before addition', resultExpression: '12 + 6' },
                { type: 'A', label: '12 + 6 = 18', busColor: 'green', description: 'Finally add', resultExpression: '18' },
            ],
        },
        {
            id: 10, title: 'Grand Finale', expression: '(1 + 2)² × 4 − 20 ÷ 5', finalAnswer: 32, difficulty: 5, timeLimit: 40,
            hint: 'The full BODMAS! B → O → D/M → A/S',
            steps: [
                { type: 'B', label: '(1 + 2) = 3', busColor: 'purple', description: 'Brackets first!', resultExpression: '3² × 4 − 20 ÷ 5' },
                { type: 'O', label: '3² = 9', busColor: 'red', description: 'Orders next!', resultExpression: '9 × 4 − 20 ÷ 5' },
                { type: 'M', label: '9 × 4 = 36', busColor: 'yellow', description: 'Multiplication', resultExpression: '36 − 20 ÷ 5' },
                { type: 'D', label: '20 ÷ 5 = 4', busColor: 'orange', description: 'Division', resultExpression: '36 − 4' },
                { type: 'S', label: '36 − 4 = 32', busColor: 'blue', description: 'Finally subtract', resultExpression: '32' },
            ],
        },
    ];
    renderLevelGrid();
}

// ---- Screen Management ----
function showScreen(screenId) {
    soundClick();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');

    if (screenId === 'menu-screen') {
        renderLevelGrid();
        updateStatsUI();
    }
}

// ---- Stats UI ----
function updateStatsUI() {
    const starsEl = document.getElementById('total-stars');
    const doneEl = document.getElementById('levels-done');
    if (starsEl) starsEl.textContent = gameState.totalStars;
    if (doneEl) doneEl.textContent = gameState.levelsCompleted;
}

// ---- Level Grid ----
function renderLevelGrid() {
    const grid = document.getElementById('level-grid');
    if (!grid) return;
    grid.innerHTML = '';

    gameState.levelsData.forEach((level, index) => {
        const card = document.createElement('div');
        card.className = 'level-card glass';

        // Determine state
        const isCompleted = gameState.highScores[level.id] !== undefined;
        const isLocked = index > 0 && gameState.highScores[gameState.levelsData[index - 1].id] === undefined;

        if (isCompleted) card.classList.add('completed');
        if (isLocked) card.classList.add('locked');

        const score = gameState.highScores[level.id] || 0;
        const starCount = score >= 250 ? 3 : score >= 150 ? 2 : score >= 1 ? 1 : 0;

        card.innerHTML = `
            <span class="level-num">${level.id}</span>
            <span class="level-stars">${isCompleted ? '⭐'.repeat(starCount) + '☆'.repeat(3 - starCount) : (isLocked ? '🔒' : '○○○')}</span>
        `;

        if (!isLocked) {
            card.addEventListener('click', () => startLevel(level.id));
        }

        grid.appendChild(card);
    });
}

// ---- Start Level ----
function startLevel(levelId) {
    initAudio();
    soundClick();

    const level = gameState.levelsData.find(l => l.id === levelId);
    if (!level) return;

    gameState.currentLevel = level;
    gameState.currentStepIndex = 0;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.streak = 0;
    gameState.mistakes = 0;
    gameState.timeLeft = level.timeLimit;
    gameState.isPaused = false;
    gameState.isPlaying = true;

    showScreen('game-screen');
    renderGame();
    startTimer();
}

// ---- Render Game ----
function renderGame() {
    const level = gameState.currentLevel;
    if (!level) return;

    // HUD
    document.getElementById('hud-level').textContent = level.id;
    document.getElementById('hud-score').textContent = gameState.score;
    updateLives();
    updateTimer();

    // Expression
    const currentExpr = gameState.currentStepIndex === 0
        ? level.expression
        : level.steps[gameState.currentStepIndex - 1].resultExpression;

    document.getElementById('expression-text').textContent = currentExpr;
    document.getElementById('expression-step').textContent = '';

    // Hint
    document.getElementById('hint-text').textContent = level.hint;

    // Buses — show remaining steps as buses (shuffled)
    renderBuses();
}

function renderBuses() {
    const container = document.getElementById('buses-container');
    container.innerHTML = '';

    const level = gameState.currentLevel;
    const remainingSteps = level.steps.slice(gameState.currentStepIndex);

    // Shuffle remaining for challenge
    const shuffled = [...remainingSteps].sort(() => Math.random() - 0.5);

    shuffled.forEach((step, i) => {
        const bus = document.createElement('div');
        bus.className = `bus-card bus-${step.busColor} waiting`;
        bus.style.setProperty('--i', i);
        bus.dataset.type = step.type;
        bus.dataset.index = level.steps.indexOf(step);

        bus.innerHTML = `
            <div class="bus-top">
                <span class="bus-emoji">${BUS_EMOJIS[step.busColor] || '🚌'}</span>
                <span class="bus-type">${TYPE_NAMES[step.type] || step.type}</span>
            </div>
            <div class="bus-bottom">
                <span class="bus-label">${step.label}</span>
            </div>
        `;

        bus.addEventListener('click', () => handleBusClick(bus, step));
        container.appendChild(bus);
    });
}

// ---- Handle Bus Click ----
function handleBusClick(busEl, step) {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const level = gameState.currentLevel;
    const correctStep = level.steps[gameState.currentStepIndex];

    if (step === correctStep) {
        // CORRECT!
        handleCorrect(busEl, step);
    } else {
        // WRONG!
        handleWrong(busEl);
    }
}

function handleCorrect(busEl, step) {
    soundCorrect();
    gameState.streak++;

    // Score calculation
    let points = 100;
    if (gameState.streak > 1) {
        points = Math.floor(points * (1 + (gameState.streak - 1) * 0.5));
    }
    // Time bonus
    const level = gameState.currentLevel;
    if (gameState.timeLeft > level.timeLimit * 0.6) {
        points += 30;
    }
    gameState.score += points;

    // Update UI
    document.getElementById('hud-score').textContent = gameState.score;

    // Bus drive-off animation
    busEl.classList.remove('waiting');
    busEl.classList.add('correct');
    busEl.style.pointerEvents = 'none';

    // Particles at bus position
    const rect = busEl.getBoundingClientRect();
    particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, getColorForBus(step.busColor));

    // Score pop
    showScorePop(rect.left + rect.width / 2, rect.top, `+${points}`);

    // Streak toast
    if (gameState.streak >= 3) {
        showStreakToast(gameState.streak);
    }

    // Show feedback
    showFeedback(true, step.description);

    // Update expression
    setTimeout(() => {
        const exprEl = document.getElementById('expression-text');
        exprEl.textContent = step.resultExpression;
        exprEl.classList.add('expression-update');
        setTimeout(() => exprEl.classList.remove('expression-update'), 500);

        document.getElementById('expression-step').textContent = step.label;
    }, 400);

    // Advance step
    gameState.currentStepIndex++;

    // Check if level complete
    setTimeout(() => {
        if (gameState.currentStepIndex >= level.steps.length) {
            levelComplete();
        } else {
            // Re-render remaining buses
            renderBuses();
            // Update hint
            document.getElementById('hint-text').textContent =
                `✅ ${step.label} — What's next?`;
        }
    }, 900);
}

function handleWrong(busEl) {
    soundWrong();
    gameState.streak = 0;
    gameState.mistakes++;
    gameState.lives--;

    // Bus shake
    busEl.classList.remove('waiting');
    busEl.classList.add('wrong');
    setTimeout(() => {
        busEl.classList.remove('wrong');
        busEl.classList.add('waiting');
    }, 600);

    // Particles
    particles.wrongFlash();

    // Update lives
    updateLives();
    showFeedback(false, 'Wrong order! Think about BODMAS priority.');

    // Hint update
    const correctStep = gameState.currentLevel.steps[gameState.currentStepIndex];
    document.getElementById('hint-text').textContent =
        `💡 Hint: Look for ${TYPE_NAMES[correctStep.type]} first!`;

    // Check game over
    if (gameState.lives <= 0) {
        setTimeout(() => gameOver(), 800);
    }
}

// ---- Timer ----
function startTimer() {
    clearInterval(gameState.timerInterval);
    updateTimer();

    gameState.timerInterval = setInterval(() => {
        if (gameState.isPaused || !gameState.isPlaying) return;

        gameState.timeLeft--;
        updateTimer();

        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            gameOver();
        }
    }, 1000);
}

function updateTimer() {
    const timerText = document.getElementById('hud-timer');
    const timerCircle = document.getElementById('timer-circle');
    const timerRing = document.getElementById('timer-ring');

    timerText.textContent = gameState.timeLeft;

    // Circle progress
    const level = gameState.currentLevel;
    if (level) {
        const progress = 1 - (gameState.timeLeft / level.timeLimit);
        const circumference = 283; // 2 * PI * 45
        timerCircle.style.strokeDashoffset = progress * circumference;

        // Warning state
        if (gameState.timeLeft <= 10) {
            timerRing.classList.add('timer-warning');
            timerText.classList.add('timer-warning');
        } else {
            timerRing.classList.remove('timer-warning');
            timerText.classList.remove('timer-warning');
        }
    }
}

function updateLives() {
    const livesEl = document.getElementById('hud-lives');
    const hearts = livesEl.querySelectorAll('.heart');
    hearts.forEach((h, i) => {
        if (i >= gameState.lives) {
            h.classList.add('lost');
            h.classList.add('shake');
            setTimeout(() => h.classList.remove('shake'), 500);
        } else {
            h.classList.remove('lost');
        }
    });
}

// ---- Level Complete ----
function levelComplete() {
    gameState.isPlaying = false;
    clearInterval(gameState.timerInterval);
    soundLevelComplete();

    const level = gameState.currentLevel;

    // Time bonus
    const timeBonus = Math.floor(gameState.timeLeft * 2);
    gameState.score += timeBonus;

    // Calculate stars
    let stars = 1;
    if (gameState.mistakes === 0 && gameState.timeLeft > level.timeLimit * 0.5) stars = 3;
    else if (gameState.mistakes <= 1) stars = 2;

    // Big confetti
    setTimeout(() => {
        particles.confetti(window.innerWidth / 2, window.innerHeight / 3, 80);
    }, 200);
    setTimeout(() => {
        particles.confetti(window.innerWidth * 0.3, window.innerHeight / 2, 40);
    }, 500);
    setTimeout(() => {
        particles.confetti(window.innerWidth * 0.7, window.innerHeight / 2, 40);
    }, 700);

    // Save score
    saveScore(level.id, gameState.score, stars);

    // Show results
    setTimeout(() => {
        showResults(stars, timeBonus);
    }, 1000);
}

function showResults(stars, timeBonus) {
    const level = gameState.currentLevel;

    document.getElementById('results-title').textContent = 'Level Complete! 🎉';
    document.getElementById('result-score').textContent = gameState.score;
    document.getElementById('result-time').textContent = `${level.timeLimit - gameState.timeLeft}s`;
    document.getElementById('result-mistakes').textContent = gameState.mistakes;
    document.getElementById('result-best').textContent = gameState.highScores[level.id] || gameState.score;
    document.getElementById('result-expr-text').textContent = level.expression;
    document.getElementById('result-answer').textContent = level.finalAnswer;

    // Stars
    const starEls = document.querySelectorAll('#results-stars .result-star');
    starEls.forEach((s, i) => {
        s.classList.remove('earned');
        if (i < stars) {
            setTimeout(() => s.classList.add('earned'), 300 + i * 400);
        }
    });

    // Next level button
    const nextBtn = document.getElementById('btn-next-level');
    const hasNext = gameState.levelsData.find(l => l.id === level.id + 1);
    nextBtn.style.display = hasNext ? '' : 'none';

    showScreen('results-screen');
}

// ---- Game Over ----
function gameOver() {
    gameState.isPlaying = false;
    clearInterval(gameState.timerInterval);
    soundGameOver();

    const level = gameState.currentLevel;
    document.getElementById('gameover-expr-text').textContent = level.expression;
    document.getElementById('gameover-answer').textContent = level.finalAnswer;

    showScreen('gameover-screen');
}

// ---- Pause ----
function pauseGame() {
    if (!gameState.isPlaying) return;
    gameState.isPaused = true;
    document.getElementById('pause-overlay').classList.add('show');
}

function resumeGame() {
    gameState.isPaused = false;
    document.getElementById('pause-overlay').classList.remove('show');
}

function quitToMenu() {
    gameState.isPlaying = false;
    gameState.isPaused = false;
    clearInterval(gameState.timerInterval);
    document.getElementById('pause-overlay').classList.remove('show');
    showScreen('menu-screen');
}

// ---- Navigation ----
function nextLevel() {
    const level = gameState.currentLevel;
    const nextId = level.id + 1;
    if (nextId <= gameState.levelsData.length) {
        startLevel(nextId);
    } else {
        showScreen('menu-screen');
    }
}

function retryLevel() {
    if (gameState.currentLevel) {
        startLevel(gameState.currentLevel.id);
    }
}

// ---- UI Helpers ----
function showFeedback(isCorrect, text) {
    const overlay = document.getElementById('feedback-overlay');
    const icon = document.getElementById('feedback-icon');
    const textEl = document.getElementById('feedback-text');
    const content = document.getElementById('feedback-content');

    icon.textContent = isCorrect ? '✅' : '❌';
    textEl.textContent = text;
    content.className = 'feedback-content ' + (isCorrect ? 'feedback-correct' : 'feedback-wrong');

    overlay.classList.add('show');
    setTimeout(() => overlay.classList.remove('show'), 1200);
}

function showScorePop(x, y, text) {
    const pop = document.createElement('div');
    pop.className = 'score-pop';
    pop.textContent = text;
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 1000);
}

function showStreakToast(streak) {
    const existing = document.querySelector('.streak-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'streak-toast';
    toast.textContent = `🔥 ${streak}x Streak!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1300);
}

function getColorForBus(color) {
    const map = {
        purple: '#a855f7',
        red: '#ef4444',
        orange: '#f97316',
        yellow: '#eab308',
        green: '#22c55e',
        blue: '#3b82f6',
    };
    return map[color] || '#ffffff';
}
