<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="BODMAS Express — An interactive Bus Jam-inspired math game that teaches operation priority through fun visual gameplay.">
    <title>BODMAS Express — The Math Bus Game</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

    <!-- ===== PARTICLE CANVAS ===== -->
    <canvas id="particleCanvas"></canvas>

    <!-- ===== SPLASH SCREEN ===== -->
    <div id="splash-screen" class="screen active">
        <div class="splash-content">
            <div class="logo-container">
                <div class="bus-icon-large">
                    <div class="bus-body-icon">🚌</div>
                </div>
                <h1 class="game-title">
                    <span class="title-letter" style="--i:0; color: var(--clr-bracket)">B</span>
                    <span class="title-letter" style="--i:1; color: var(--clr-order)">O</span>
                    <span class="title-letter" style="--i:2; color: var(--clr-division)">D</span>
                    <span class="title-letter" style="--i:3; color: var(--clr-multiply)">M</span>
                    <span class="title-letter" style="--i:4; color: var(--clr-addition)">A</span>
                    <span class="title-letter" style="--i:5; color: var(--clr-subtract)">S</span>
                </h1>
                <p class="game-subtitle">E X P R E S S</p>
                <p class="tagline">Master Math Priority, One Bus at a Time!</p>
            </div>
            <button class="btn-primary btn-glow" id="btn-play" onclick="showScreen('menu-screen')">
                <span>🎮</span> START GAME
            </button>
            <div class="splash-footer">
                <div class="bodmas-legend">
                    <span class="legend-item" style="--c: var(--clr-bracket)">B<small>rackets</small></span>
                    <span class="legend-item" style="--c: var(--clr-order)">O<small>rders</small></span>
                    <span class="legend-item" style="--c: var(--clr-division)">D<small>ivision</small></span>
                    <span class="legend-item" style="--c: var(--clr-multiply)">M<small>ultiply</small></span>
                    <span class="legend-item" style="--c: var(--clr-addition)">A<small>ddition</small></span>
                    <span class="legend-item" style="--c: var(--clr-subtract)">S<small>ubtract</small></span>
                </div>
            </div>
        </div>
    </div>

    <!-- ===== MENU SCREEN ===== -->
    <div id="menu-screen" class="screen">
        <div class="menu-container">
            <h2 class="screen-title">Select Level</h2>
            <div class="player-info">
                <div class="stat-card glass">
                    <span class="stat-icon">⭐</span>
                    <span class="stat-value" id="total-stars">0</span>
                    <span class="stat-label">Stars</span>
                </div>
                <div class="stat-card glass">
                    <span class="stat-icon">🏆</span>
                    <span class="stat-value" id="levels-done">0</span>
                    <span class="stat-label">Completed</span>
                </div>
            </div>
            <div class="level-grid" id="level-grid">
                <!-- Levels injected by JS -->
            </div>
            <div class="menu-buttons">
                <button class="btn-secondary" onclick="showScreen('tutorial-screen')">📖 How to Play</button>
                <button class="btn-secondary" onclick="showScreen('splash-screen')">🏠 Home</button>
            </div>
        </div>
    </div>

    <!-- ===== TUTORIAL SCREEN ===== -->
    <div id="tutorial-screen" class="screen">
        <div class="tutorial-container glass">
            <h2 class="screen-title">How to Play</h2>
            <div class="tutorial-steps">
                <div class="tut-step">
                    <div class="tut-num">1</div>
                    <div class="tut-text">
                        <h3>Read the Expression</h3>
                        <p>A math expression appears at the top of the screen.</p>
                    </div>
                </div>
                <div class="tut-step">
                    <div class="tut-num">2</div>
                    <div class="tut-text">
                        <h3>Pick the Right Bus</h3>
                        <p>Color-coded buses represent each operation. Tap the one that should be solved <strong>first</strong> according to BODMAS rules!</p>
                    </div>
                </div>
                <div class="tut-step">
                    <div class="tut-num">3</div>
                    <div class="tut-text">
                        <h3>Watch It Depart!</h3>
                        <p>Correct pick? The bus drives off and the expression updates. Wrong pick? You lose a life! ❤️</p>
                    </div>
                </div>
                <div class="tut-step">
                    <div class="tut-num">4</div>
                    <div class="tut-text">
                        <h3>Earn Stars ⭐</h3>
                        <p>Solve fast with no mistakes to earn 3 stars! Beat all 10 levels to become a BODMAS Master!</p>
                    </div>
                </div>
            </div>
            <div class="bodmas-chart glass">
                <h3>BODMAS Priority</h3>
                <div class="priority-list">
                    <div class="priority-item" style="--c: var(--clr-bracket)">
                        <span class="pri-rank">1st</span>
                        <span class="pri-bus">🟣</span>
                        <span class="pri-name">Brackets ( )</span>
                    </div>
                    <div class="priority-item" style="--c: var(--clr-order)">
                        <span class="pri-rank">2nd</span>
                        <span class="pri-bus">🔴</span>
                        <span class="pri-name">Orders (², √)</span>
                    </div>
                    <div class="priority-item" style="--c: var(--clr-division)">
                        <span class="pri-rank">3rd</span>
                        <span class="pri-bus">🟠</span>
                        <span class="pri-name">Division ÷</span>
                    </div>
                    <div class="priority-item" style="--c: var(--clr-multiply)">
                        <span class="pri-rank">3rd</span>
                        <span class="pri-bus">🟡</span>
                        <span class="pri-name">Multiplication ×</span>
                    </div>
                    <div class="priority-item" style="--c: var(--clr-addition)">
                        <span class="pri-rank">4th</span>
                        <span class="pri-bus">🟢</span>
                        <span class="pri-name">Addition +</span>
                    </div>
                    <div class="priority-item" style="--c: var(--clr-subtract)">
                        <span class="pri-rank">4th</span>
                        <span class="pri-bus">🔵</span>
                        <span class="pri-name">Subtraction −</span>
                    </div>
                </div>
            </div>
            <button class="btn-primary" onclick="showScreen('menu-screen')">Got It! 👍</button>
        </div>
    </div>

    <!-- ===== GAME SCREEN ===== -->
    <div id="game-screen" class="screen">
        <div class="game-container">
            <!-- Top HUD -->
            <div class="game-hud">
                <div class="hud-left">
                    <button class="btn-icon" onclick="pauseGame()" id="btn-pause" title="Pause">⏸️</button>
                    <div class="level-badge glass">
                        <span>Lvl</span>
                        <strong id="hud-level">1</strong>
                    </div>
                </div>
                <div class="hud-center">
                    <div class="timer-ring" id="timer-ring">
                        <svg viewBox="0 0 100 100">
                            <circle class="timer-bg" cx="50" cy="50" r="45"/>
                            <circle class="timer-fg" cx="50" cy="50" r="45" id="timer-circle"/>
                        </svg>
                        <span class="timer-text" id="hud-timer">60</span>
                    </div>
                </div>
                <div class="hud-right">
                    <div class="lives" id="hud-lives">
                        <span class="heart live">❤️</span>
                        <span class="heart live">❤️</span>
                        <span class="heart live">❤️</span>
                    </div>
                    <div class="score-display glass">
                        <span>Score</span>
                        <strong id="hud-score">0</strong>
                    </div>
                </div>
            </div>

            <!-- Expression Display -->
            <div class="expression-panel glass" id="expression-panel">
                <div class="expression-label">SOLVE:</div>
                <div class="expression-text" id="expression-text">2 + 3 × 4</div>
                <div class="expression-step" id="expression-step"></div>
            </div>

            <!-- Hint bar -->
            <div class="hint-bar" id="hint-bar">
                <span class="hint-icon">💡</span>
                <span class="hint-text" id="hint-text">Tap the bus with the operation to solve first!</span>
            </div>

            <!-- Bus Station Area -->
            <div class="bus-station" id="bus-station">
                <div class="road">
                    <div class="road-line"></div>
                </div>
                <div class="buses-container" id="buses-container">
                    <!-- Buses injected by JS -->
                </div>
                <div class="station-sign glass">
                    <span>🚏 BODMAS Station</span>
                </div>
            </div>

            <!-- Feedback overlay -->
            <div class="feedback-overlay" id="feedback-overlay">
                <div class="feedback-content" id="feedback-content">
                    <div class="feedback-icon" id="feedback-icon">✅</div>
                    <div class="feedback-text" id="feedback-text">Correct!</div>
                </div>
            </div>
        </div>
    </div>

    <!-- ===== PAUSE OVERLAY ===== -->
    <div id="pause-overlay" class="overlay">
        <div class="overlay-card glass">
            <h2>⏸️ Paused</h2>
            <button class="btn-primary" onclick="resumeGame()">▶️ Resume</button>
            <button class="btn-secondary" onclick="quitToMenu()">🏠 Quit to Menu</button>
        </div>
    </div>

    <!-- ===== RESULTS SCREEN ===== -->
    <div id="results-screen" class="screen">
        <div class="results-container glass">
            <div class="results-header">
                <h2 id="results-title">Level Complete!</h2>
                <div class="results-stars" id="results-stars">
                    <span class="result-star">⭐</span>
                    <span class="result-star">⭐</span>
                    <span class="result-star">⭐</span>
                </div>
            </div>
            <div class="results-stats">
                <div class="result-stat">
                    <span class="rs-label">Score</span>
                    <span class="rs-value" id="result-score">0</span>
                </div>
                <div class="result-stat">
                    <span class="rs-label">Time</span>
                    <span class="rs-value" id="result-time">0s</span>
                </div>
                <div class="result-stat">
                    <span class="rs-label">Mistakes</span>
                    <span class="rs-value" id="result-mistakes">0</span>
                </div>
                <div class="result-stat">
                    <span class="rs-label">Best</span>
                    <span class="rs-value" id="result-best">0</span>
                </div>
            </div>
            <div class="result-expression">
                <p id="result-expr-text"></p>
                <p class="result-answer">= <span id="result-answer">0</span></p>
            </div>
            <div class="results-buttons">
                <button class="btn-secondary" onclick="quitToMenu()">🏠 Menu</button>
                <button class="btn-primary" id="btn-next-level" onclick="nextLevel()">Next Level ➡️</button>
                <button class="btn-secondary" onclick="retryLevel()">🔄 Retry</button>
            </div>
        </div>
    </div>

    <!-- ===== GAME OVER SCREEN ===== -->
    <div id="gameover-screen" class="screen">
        <div class="results-container glass gameover">
            <div class="results-header">
                <div class="gameover-icon">💔</div>
                <h2>Game Over</h2>
                <p class="gameover-msg">You ran out of lives! Don't worry, practice makes perfect.</p>
            </div>
            <div class="result-expression">
                <p id="gameover-expr-text"></p>
                <p class="result-answer">Answer: <span id="gameover-answer">0</span></p>
            </div>
            <div class="results-buttons">
                <button class="btn-primary" onclick="retryLevel()">🔄 Try Again</button>
                <button class="btn-secondary" onclick="quitToMenu()">🏠 Menu</button>
            </div>
        </div>
    </div>

    <script src="js/particles.js"></script>
    <script src="js/game.js"></script>
</body>
</html>
