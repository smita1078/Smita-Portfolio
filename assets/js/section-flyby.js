/* ================================
   SECTION FLYBY
   Spawns tech-themed icons that fly across a section in 3D
   whenever that section scrolls into view. Confined to the
   section itself (each section clips its own layer), so
   nothing drifts over the nav or neighboring sections.
   ================================ */

(function () {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Icon set + accent color per section id.
    const SECTION_ICONS = {
        about: { icons: ['fa-solid fa-code', 'fa-solid fa-terminal', 'fa-brands fa-java'], color: '#00ff88' },
        education: { icons: ['fa-solid fa-graduation-cap', 'fa-solid fa-book', 'fa-solid fa-pen-nib'], color: '#0088ff' },
        work: { icons: ['fa-brands fa-react', 'fa-solid fa-laptop-code', 'fa-brands fa-node-js', 'fa-solid fa-terminal'], color: '#00ff88' },
        skills: { icons: ['fa-solid fa-server', 'fa-solid fa-database', 'fa-solid fa-cloud', 'fa-brands fa-docker', 'fa-solid fa-microchip'], color: '#0088ff' },
        experience: { icons: ['fa-solid fa-briefcase', 'fa-solid fa-server', 'fa-solid fa-diagram-project'], color: '#ff0088' },
        gsoc: { icons: ['fa-brands fa-github', 'fa-solid fa-code-branch', 'fa-solid fa-code-pull-request'], color: '#00ff88' },
        achievements: { icons: ['fa-solid fa-trophy', 'fa-solid fa-medal', 'fa-solid fa-star'], color: '#ff0088' },
        github: { icons: ['fa-brands fa-github', 'fa-solid fa-code-commit', 'fa-solid fa-code-branch'], color: '#0088ff' },
        contact: { icons: ['fa-solid fa-paper-plane', 'fa-solid fa-envelope', 'fa-solid fa-satellite-dish'], color: '#00ff88' }
    };

    const activeIntervals = new Map();

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function ensureLayer(section) {
        let layer = section.querySelector(':scope > .flyby-layer');
        if (!layer) {
            const cs = window.getComputedStyle(section);
            if (cs.position === 'static') section.style.position = 'relative';
            layer = document.createElement('div');
            layer.className = 'flyby-layer';
            section.insertBefore(layer, section.firstChild);
        }
        return layer;
    }

    function spawnObject(layer, config) {
        const icon = config.icons[Math.floor(Math.random() * config.icons.length)];
        const el = document.createElement('i');
        const reverse = Math.random() < 0.5;
        el.className = icon + (reverse ? ' flyby-obj flyby-reverse' : ' flyby-obj');
        el.style.setProperty('--fy-top', rand(8, 85) + '%');
        el.style.setProperty('--fy-size', rand(1.6, 3.2).toFixed(2) + 'rem');
        el.style.setProperty('--fy-color', config.color);
        el.style.setProperty('--fy-dur', rand(3.2, 5.5).toFixed(2) + 's');
        el.style.setProperty('--fy-drift', rand(-60, 60).toFixed(0) + 'px');
        el.style.setProperty('--fy-drift2', rand(-60, 60).toFixed(0) + 'px');
        layer.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
        setTimeout(() => el.remove(), 7000);
    }

    function startSpawning(section, config) {
        if (activeIntervals.has(section)) return;
        const layer = ensureLayer(section);
        const count = window.matchMedia('(max-width: 700px)').matches ? 1 : 2;

        for (let i = 0; i < count; i++) {
            setTimeout(() => spawnObject(layer, config), i * 500);
        }

        const interval = setInterval(() => {
            for (let i = 0; i < count; i++) {
                spawnObject(layer, config);
            }
        }, 2600);

        activeIntervals.set(section, interval);
    }

    function stopSpawning(section) {
        const interval = activeIntervals.get(section);
        if (interval) {
            clearInterval(interval);
            activeIntervals.delete(section);
        }
    }

    function init() {
        const sections = Object.keys(SECTION_ICONS)
            .map((id) => document.getElementById(id))
            .filter(Boolean);

        if (!sections.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const config = SECTION_ICONS[entry.target.id];
                if (!config) return;
                if (entry.isIntersecting) {
                    startSpawning(entry.target, config);
                } else {
                    stopSpawning(entry.target);
                }
            });
        }, { threshold: 0.2 });

        sections.forEach((section) => observer.observe(section));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
