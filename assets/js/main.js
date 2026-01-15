/* ================================
   MAIN JAVASCRIPT
   ================================ */

(function() {
    'use strict';

    // ================================
    // INTERSECTION OBSERVER
    // ================================

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all elements with fade-up class
    const observeElements = () => {
        const elements = document.querySelectorAll(
            '.fade-up, .section-title, .work-item, .skill-card, ' +
            '.timeline-item, .education-card, .achievement-card'
        );

        elements.forEach(el => observer.observe(el));
    };

    // ================================
    // SMOOTH SCROLL
    // ================================

    const setupSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);

                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    };

    // ================================
    // NAVBAR SCROLL EFFECT
    // ================================

    const setupNavbarScroll = () => {
        const navbar = document.querySelector('nav');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        });
    };

    // ================================
    // WORK ITEM CLICK HANDLER
    // ================================

    const setupWorkItemClicks = () => {
        document.querySelectorAll('.work-item').forEach(item => {
            // Prevent link clicks from triggering the parent click
            item.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            });
        });
    };

    // ================================
    // SCROLL INDICATOR
    // ================================

    const setupScrollIndicator = () => {
        const scrollIndicator = document.querySelector('.scroll-indicator');

        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                const aboutSection = document.querySelector('#about');
                if (aboutSection) {
                    aboutSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });

            // Hide scroll indicator when user scrolls down
            window.addEventListener('scroll', () => {
                if (window.scrollY > 200) {
                    scrollIndicator.style.opacity = '0';
                    scrollIndicator.style.pointerEvents = 'none';
                } else {
                    scrollIndicator.style.opacity = '1';
                    scrollIndicator.style.pointerEvents = 'auto';
                }
            });
        }
    };

    // ================================
    // ENHANCED CURSOR INTERACTIONS
    // ================================

    const setupEnhancedCursorInteractions = () => {
        // Add subtle scale effect to cards on hover
        const cards = document.querySelectorAll(
            '.skill-card, .achievement-card, .education-card, .github-card'
        );

        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    };

    // ================================
    // LAZY LOAD IMAGES
    // ================================

    const setupLazyLoadImages = () => {
        const images = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    };

    // ================================
    // INITIALIZE ALL
    // ================================

    const init = () => {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                observeElements();
                setupSmoothScroll();
                setupNavbarScroll();
                setupWorkItemClicks();
                setupScrollIndicator();
                setupEnhancedCursorInteractions();
                setupLazyLoadImages();
            });
        } else {
            // DOM already loaded
            observeElements();
            setupSmoothScroll();
            setupNavbarScroll();
            setupWorkItemClicks();
            setupScrollIndicator();
            setupEnhancedCursorInteractions();
            setupLazyLoadImages();
        }
    };

    // Start initialization
    init();

})();