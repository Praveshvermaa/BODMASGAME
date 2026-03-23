/* =========================================
   BODMAS Express — Particle System
   Canvas-based particle effects for celebrations
   ========================================= */

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.bgParticles = [];
        this.animating = false;
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initBackground();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /* --- Background Floating Particles --- */
    initBackground() {
        const count = Math.min(40, Math.floor(window.innerWidth / 30));
        for (let i = 0; i < count; i++) {
            this.bgParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.3 + 0.05,
                color: ['#a855f7', '#06b6d4', '#f97316', '#22c55e', '#3b82f6', '#eab308'][Math.floor(Math.random() * 6)],
            });
        }
    }

    /* --- Confetti Burst --- */
    confetti(x, y, count = 60) {
        const colors = ['#a855f7', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#06b6d4', '#ec4899'];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = Math.random() * 8 + 3;
            this.particles.push({
                x: x || this.canvas.width / 2,
                y: y || this.canvas.height / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1,
                decay: Math.random() * 0.015 + 0.008,
                gravity: 0.12,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.2,
                shape: Math.random() > 0.5 ? 'rect' : 'circle',
            });
        }
    }

    /* --- Score Sparkle --- */
    sparkle(x, y, color = '#eab308', count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 3 + 1;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 1,
                color,
                life: 1,
                decay: 0.03,
                gravity: 0,
                rotation: 0,
                rotSpeed: 0,
                shape: 'circle',
            });
        }
    }

    /* --- Wrong Answer Flash --- */
    wrongFlash() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: 0,
                vy: 0,
                size: Math.random() * 80 + 40,
                color: 'rgba(239, 68, 68, 0.1)',
                life: 1,
                decay: 0.05,
                gravity: 0,
                rotation: 0,
                rotSpeed: 0,
                shape: 'circle',
            });
        }
    }

    /* --- Animation Loop --- */
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Background particles
        for (const p of this.bgParticles) {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1;

        // Effect particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vx *= 0.98;
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            p.rotation += p.rotSpeed;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;

            if (p.shape === 'rect') {
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.restore();
        }

        requestAnimationFrame(() => this.animate());
    }
}
