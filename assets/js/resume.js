/* ================================
   ANIMATED RESUME — anime.js
   ================================ */

(function () {
    'use strict';

    if (typeof anime === 'undefined') return;

    function animateName() {
        const el = document.querySelector('.resume-name');
        if (!el) return;
        const text = el.textContent;
        el.textContent = '';
        text.split('').forEach((ch) => {
            const span = document.createElement('span');
            span.textContent = ch === ' ' ? '\u00A0' : ch;
            span.style.opacity = '0';
            el.appendChild(span);
        });

        anime.timeline({ easing: 'easeOutExpo' })
            .add({
                targets: '.resume-name span',
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 800,
                delay: anime.stagger(30)
            })
            .add({
                targets: '.resume-contact',
                opacity: [0, 1],
                translateY: [10, 0],
                duration: 600
            }, '-=400');
    }

    function typewriterRole() {
        const el = document.querySelector('.resume-role');
        if (!el) return;
        const roles = [
            'Software Engineer',
            'Backend & Microservices Engineer',
            'Google Summer of Code 2026 Contributor'
        ];
        const textSpan = document.createElement('span');
        textSpan.className = 'role-text';
        const cursor = document.createElement('span');
        cursor.className = 'cursor-blink';
        el.textContent = '';
        el.appendChild(textSpan);
        el.appendChild(cursor);

        let roleIndex = 0;

        function typeRole(str, i, cb) {
            if (i <= str.length) {
                textSpan.textContent = str.slice(0, i);
                setTimeout(() => typeRole(str, i + 1, cb), 45);
            } else {
                setTimeout(cb, 1400);
            }
        }

        function eraseRole(str, i, cb) {
            if (i >= 0) {
                textSpan.textContent = str.slice(0, i);
                setTimeout(() => eraseRole(str, i - 1, cb), 25);
            } else {
                cb();
            }
        }

        function loop() {
            const current = roles[roleIndex % roles.length];
            typeRole(current, 0, () => {
                eraseRole(current, current.length, () => {
                    roleIndex++;
                    loop();
                });
            });
        }

        loop();
    }

    function animateOnIntersect(selector, config, opts) {
        const els = document.querySelectorAll(selector);
        if (!els.length) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = 'true';
                    anime(Object.assign({ targets: entry.target }, config));
                    io.unobserve(entry.target);
                }
            });
        }, opts || { threshold: 0.15 });
        els.forEach((el) => io.observe(el));
    }

    function animateStagger(containerSelector, itemSelector, config) {
        const containers = document.querySelectorAll(containerSelector);
        if (!containers.length) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !entry.target.dataset.staggered) {
                    entry.target.dataset.staggered = 'true';
                    const items = entry.target.querySelectorAll(itemSelector);
                    anime(Object.assign({ targets: items, delay: anime.stagger(120) }, config));
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        containers.forEach((el) => io.observe(el));
    }

    function animateSkillBars() {
        const bars = document.querySelectorAll('.resume-skill-fill');
        if (!bars.length) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !entry.target.dataset.filled) {
                    entry.target.dataset.filled = 'true';
                    const pct = entry.target.dataset.pct || '0';
                    anime({
                        targets: entry.target,
                        width: pct + '%',
                        duration: 1400,
                        easing: 'easeOutExpo'
                    });
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        bars.forEach((el) => io.observe(el));
    }

    function setupTilt() {
        document.querySelectorAll('.tilt-3d').forEach((el) => {
            let bounds;
            el.style.position = el.style.position || 'relative';
            const glare = document.createElement('div');
            glare.className = 'tilt-glare';
            el.appendChild(glare);

            el.addEventListener('mouseenter', () => { bounds = el.getBoundingClientRect(); });
            el.addEventListener('mousemove', (e) => {
                if (!bounds) bounds = el.getBoundingClientRect();
                const px = (e.clientX - bounds.left) / bounds.width;
                const py = (e.clientY - bounds.top) / bounds.height;
                const rotateX = (py - 0.5) * -8;
                const rotateY = (px - 0.5) * 8;
                el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
                glare.style.setProperty('--gx', `${px * 100}%`);
                glare.style.setProperty('--gy', `${py * 100}%`);
            });
            el.addEventListener('mouseleave', () => {
                anime({
                    targets: el,
                    duration: 500,
                    easing: 'easeOutElastic(1, .6)',
                    update: () => { el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)'; }
                });
            });
        });
    }

    function setupPrintButton() {
        const btn = document.getElementById('printResumeBtn');
        if (btn) btn.addEventListener('click', () => window.print());
    }

    function init() {
        animateName();
        typewriterRole();

        animateOnIntersect('.resume-summary', {
            opacity: [0, 1],
            translateY: [15, 0],
            duration: 800
        });

        animateStagger('.resume-skills-grid', '.resume-skill', {
            opacity: [0, 1],
            translateX: [-20, 0],
            duration: 600,
            easing: 'easeOutQuad'
        });
        animateSkillBars();

        animateStagger('.resume-experience', '.resume-job', {
            opacity: [0, 1],
            translateX: [-30, 0],
            duration: 700,
            easing: 'easeOutExpo'
        });

        animateStagger('.resume-card-grid', '.resume-card', {
            opacity: [0, 1],
            translateY: [25, 0],
            duration: 600,
            easing: 'easeOutExpo'
        });

        animateStagger('.resume-achievements-list', 'li', {
            opacity: [0, 1],
            translateX: [-15, 0],
            duration: 500,
            easing: 'easeOutQuad'
        });

        setupTilt();
        setupPrintButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
