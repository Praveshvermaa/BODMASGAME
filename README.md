# 🚌 BODMAS Express — The Math Bus Game

An interactive **Bus Jam-inspired** game that teaches BODMAS (Brackets, Orders, Division, Multiplication, Addition, Subtraction) priority through fun visual gameplay.

## 🎮 How It Works

1. A math expression appears on screen (e.g. `2 + 3 × 4`)
2. Color-coded **buses** represent each operation
3. Tap the bus that should be solved **first** according to BODMAS rules
4. Correct pick → bus drives off & expression updates
5. Wrong pick → lose a life! You get 3 lives per level

## 🎯 Features

- **10 levels** of increasing difficulty — from simple `2 + 3 × 4` to complex `(1 + 2)² × 4 − 20 ÷ 5`
- **Color-coded buses** for each BODMAS category:
  - 🟣 **Brackets** (Purple)
  - 🔴 **Orders/Exponents** (Red)
  - 🟠 **Division** (Orange)
  - 🟡 **Multiplication** (Yellow)
  - 🟢 **Addition** (Green)
  - 🔵 **Subtraction** (Blue)
- **Shuffled buses** — operations appear in random order each attempt
- **Timer & scoring** with streak multiplier for consecutive correct answers
- **⭐ Star ratings** — 1 to 3 stars based on speed and accuracy
- **Progressive unlock** — complete a level to unlock the next
- **Sound effects** via Web Audio API
- **Confetti & particles** on level completion
- **Score persistence** via localStorage
- **Built-in tutorial** explaining BODMAS rules
- **Fully responsive** — works on desktop and mobile

## 🛠️ Tech Stack

- **HTML5** — Semantic structure
- **CSS3** — Dark theme, glassmorphism, animations
- **JavaScript** — Game engine, particle system, Web Audio API

## 🚀 Getting Started

Just open `index.html` in any modern browser — no server or installation needed!

```bash
# Clone the repo
git clone https://github.com/Praveshvermaa/BODMASGAME.git

# Open in browser
start index.html
```

## 📁 Project Structure

```
BODMASHGAME/
├── index.html        # Main game page
├── css/
│   └── style.css     # Styling & animations
├── js/
│   ├── game.js       # Game engine & logic
│   └── particles.js  # Canvas particle effects
└── README.md
```

## 📸 Screenshots

### Splash Screen
The landing page with animated BODMAS title and color-coded legend.

### Level Selection
10-level grid with stars, lock system, and player stats.

### Gameplay
Expression panel, color-coded operation buses at the station, timer, lives, and score HUD.

## 📖 BODMAS Priority

| Priority | Operation | Symbol |
|----------|-----------|--------|
| 1st | **B**rackets | ( ) |
| 2nd | **O**rders | ², √ |
| 3rd | **D**ivision | ÷ |
| 3rd | **M**ultiplication | × |
| 4th | **A**ddition | + |
| 4th | **S**ubtraction | − |

> Division & Multiplication have **equal priority** (solve left to right).  
> Addition & Subtraction have **equal priority** (solve left to right).

## 👤 Author

**Pravesh Verma** — [@Praveshvermaa](https://github.com/Praveshvermaa)

## 📄 License

This project is open source and available for educational purposes.
