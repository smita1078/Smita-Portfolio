/* ================================
   ANIME.JS POWERED ANIMATIONS
   ================================ */

(function () {
    'use strict';

    if (typeof anime === 'undefined') return;

    // ================================
    // HERO TITLE — LETTER-BY-LETTER REVEAL
    // ================================

    function animateHeroTitle() {
        const title = document.querySelector('.hero-title');
        if (!title) return;

        const text = title.textContent;
        title.textContent = '';
        title.style.opacity = 1; // override CSS keyframe so letters control visibility

        text.split('').forEach((char) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            span.style.opacity = '0';
            title.appendChild(span);
        });

        anime.timeline({ easing: 'easeOutExpo' })
            .add({
                targets: '.hero-title span',
                opacity: [0, 1],
                translateY: [40, 0],
                rotateZ: [8, 0],
                duration: 900,
                delay: anime.stagger(35)
            })
            .add({
                targets: '.status-badge',
                opacity: [0, 1],
                translateX: [-20, 0],
                duration: 600
            }, '-=700')
            .add({
                targets: '.hero-subtitle',
                opacity: [0, 1],
                translateY: [15, 0],
                duration: 700
            }, '-=500')
            .add({
                targets: '.hero-buttons',
                opacity: [0, 1],
                translateY: [15, 0],
                duration: 700
            }, '-=500');
    }

    // ================================
    // NAV LINKS STAGGER-IN
    // ================================

    function animateNav() {
        anime({
            targets: '.nav-links li',
            opacity: [0, 1],
            translateY: [-12, 0],
            duration: 600,
            delay: anime.stagger(60, { start: 300 }),
            easing: 'easeOutQuad'
        });
        anime({
            targets: '.logo',
            opacity: [0, 1],
            scale: [0.5, 1],
            duration: 700,
            easing: 'easeOutBack'
        });
    }

    // ================================
    // SECTION TITLE UNDERLINE SWEEP + STAGGER GRIDS ON SCROLL
    // ================================

    function animateOnIntersect(selector, animConfig, options) {
        const els = document.querySelectorAll(selector);
        if (!els.length) return;

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = 'true';
                    anime(Object.assign({ targets: entry.target }, animConfig));
                    io.unobserve(entry.target);
                }
            });
        }, options || { threshold: 0.2 });

        els.forEach((el) => io.observe(el));
    }

    function animateStaggerGroup(containerSelector, itemSelector, animConfig) {
        const containers = document.querySelectorAll(containerSelector);
        if (!containers.length) return;

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !entry.target.dataset.staggered) {
                    entry.target.dataset.staggered = 'true';
                    const items = entry.target.querySelectorAll(itemSelector);
                    anime(Object.assign({
                        targets: items,
                        delay: anime.stagger(90)
                    }, animConfig));
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        containers.forEach((el) => io.observe(el));
    }

    // ================================
    // ANIMATED COUNTERS (GitHub stats, GSoC stats)
    // ================================

    function animateCounter(el, endValue, suffix) {
        const obj = { val: 0 };
        anime({
            targets: obj,
            val: endValue,
            round: 1,
            easing: 'easeOutCubic',
            duration: 1600,
            update: () => {
                el.textContent = obj.val + (suffix || '');
            }
        });
    }

    function setupCounterObserver() {
        const counters = document.querySelectorAll('[data-counter]');
        if (!counters.length) return;

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !entry.target.dataset.counted) {
                    entry.target.dataset.counted = 'true';
                    const target = parseInt(entry.target.dataset.counter, 10);
                    const suffix = entry.target.dataset.suffix || '';
                    animateCounter(entry.target, target, suffix);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        counters.forEach((el) => io.observe(el));
    }

    // ================================
    // 3D TILT ON HOVER (perspective transform, no external lib)
    // ================================

    function setupTilt() {
        const tiltEls = document.querySelectorAll('.tilt-3d');

        tiltEls.forEach((el) => {
            const glare = document.createElement('div');
            glare.className = 'tilt-glare';
            el.appendChild(glare);
            el.style.position = el.style.position || 'relative';

            let bounds;

            const enter = () => {
                bounds = el.getBoundingClientRect();
            };

            const move = (e) => {
                if (!bounds) bounds = el.getBoundingClientRect();
                const x = e.clientX - bounds.left;
                const y = e.clientY - bounds.top;
                const px = x / bounds.width;
                const py = y / bounds.height;

                const rotateX = (py - 0.5) * -10;
                const rotateY = (px - 0.5) * 10;

                el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;
                glare.style.setProperty('--gx', `${px * 100}%`);
                glare.style.setProperty('--gy', `${py * 100}%`);
            };

            const leave = () => {
                anime({
                    targets: el,
                    rotateX: 0,
                    rotateY: 0,
                    duration: 500,
                    easing: 'easeOutElastic(1, .6)',
                    update: () => {
                        el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
                    }
                });
            };

            el.addEventListener('mouseenter', enter);
            el.addEventListener('mousemove', move);
            el.addEventListener('mouseleave', leave);
        });
    }

    // ================================
    // BUTTON MORPH ON HOVER
    // ================================

    function setupButtonMorph() {
        document.querySelectorAll('.hero-btn, .work-link, .contact-link').forEach((btn) => {
            btn.addEventListener('mouseenter', () => {
                anime({
                    targets: btn,
                    scale: 1.05,
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            });
            btn.addEventListener('mouseleave', () => {
                anime({
                    targets: btn,
                    scale: 1,
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            });
        });
    }

    // ================================
    // TIMELINE DOT PULSE + LINE DRAW
    // ================================

    function animateTimeline() {
        animateStaggerGroup('.timeline', '.timeline-item', {
            opacity: [0, 1],
            translateX: [-40, 0],
            duration: 800,
            easing: 'easeOutExpo'
        });

        animateOnIntersect('.timeline-dot', {
            scale: [0, 1.4, 1],
            opacity: [0, 1],
            duration: 700,
            easing: 'easeOutElastic(1, .5)'
        }, { threshold: 0.3 });
    }

    // ================================
    // INIT
    // ================================

    function init() {
        animateHeroTitle();
        animateNav();

        animateStaggerGroup('.skills-grid', '.skill-card', {
            opacity: [0, 1],
            translateY: [40, 0],
            scale: [0.9, 1],
            duration: 700,
            easing: 'easeOutExpo'
        });

        animateStaggerGroup('.achievements-grid', '.achievement-card', {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 700,
            easing: 'easeOutExpo'
        });

        animateStaggerGroup('.education-grid', '.education-card', {
            opacity: [0, 1],
            translateX: [-40, 0],
            duration: 700,
            easing: 'easeOutExpo'
        });

        animateStaggerGroup('.gsoc-stats', '.gsoc-stat-card', {
            opacity: [0, 1],
            translateY: [30, 0],
            scale: [0.85, 1],
            duration: 700,
            easing: 'easeOutExpo'
        });

        animateStaggerGroup('.gsoc-work-grid', '.gsoc-work-card', {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 700,
            easing: 'easeOutExpo'
        });

        animateOnIntersect('.gsoc-banner', {
            opacity: [0, 1],
            scale: [0.96, 1],
            duration: 800,
            easing: 'easeOutExpo'
        }, { threshold: 0.2 });

        animateTimeline();
        setupCounterObserver();
        setupTilt();
        setupButtonMorph();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
