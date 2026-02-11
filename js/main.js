/* ==================== MAIN APPLICATION — Phase 3 ==================== */
(function () {
    'use strict';

    /* ========== LOADER ========== */
    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loader-bar');
    const loaderText = document.getElementById('loader-text');
    let loadProgress = 0;

    function updateLoader(pct, text) {
        loadProgress = Math.max(loadProgress, pct);
        if (loaderBar) loaderBar.style.width = loadProgress + '%';
        if (loaderText && text) loaderText.textContent = text;
    }

    window.NVScenes = window.NVScenes || {};
    window.NVScenes.onGPUProgress = function (pct) {
        updateLoader(30 + pct * 40, 'Loading GPU model...');
    };
    window.NVScenes.onGPULoaded = function () {
        updateLoader(80, 'GPU model loaded');
    };

    /* ========== SECTIONS & NAV ========== */
    const allSections = document.querySelectorAll('.section');
    const navDots = document.querySelectorAll('.nav-dot');
    let currentSection = 0;
    let isScrolling = false;

    function updateNavDots(index) {
        navDots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === index);
        });
    }

    navDots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var idx = parseInt(this.dataset.section);
            if (idx !== currentSection && !isScrolling) {
                navigateToSection(idx);
            }
        });
    });

    // Make Agenda Items Clickable
    document.querySelectorAll('.agenda-item').forEach(function (item) {
        item.addEventListener('click', function () {
            var target = parseInt(this.getAttribute('data-goto'));
            if (!isNaN(target) && !isScrolling) {
                navigateToSection(target);
            }
        });
    });

    /* ========== SNAP SCROLL ENGINE ========== */
    function navigateToSection(targetIndex) {
        if (isScrolling || targetIndex === currentSection) return;
        if (targetIndex < 0 || targetIndex >= allSections.length) return;
        isScrolling = true;

        var prevSection = allSections[currentSection];
        var nextSection = allSections[targetIndex];
        var direction = targetIndex > currentSection ? 1 : -1;

        var prevInner = prevSection.querySelector('.section-inner');
        gsap.to(prevInner, {
            opacity: 0,
            scale: 0.95,
            y: direction * -40,
            duration: 0.45,
            ease: 'power2.in',
            onComplete: function () {
                gsap.to(window, {
                    scrollTo: { y: nextSection, autoKill: false },
                    duration: 0.5,
                    ease: 'power2.inOut',
                    onComplete: function () {
                        currentSection = targetIndex;
                        updateNavDots(currentSection);
                        gsap.set(prevInner, { opacity: 1, scale: 1, y: 0 });

                        var nextInner = nextSection.querySelector('.section-inner');
                        gsap.fromTo(nextInner,
                            { opacity: 0, scale: 0.95, y: direction * 40 },
                            {
                                opacity: 1, scale: 1, y: 0,
                                duration: 0.5,
                                ease: 'power2.out',
                                onComplete: function () {
                                    isScrolling = false;
                                    triggerSectionAnimations(targetIndex);
                                    updateProgressBar(targetIndex);
                                }
                            }
                        );
                    }
                });
            }
        });
    }

    // Wheel
    var scrollCooldown = 0;
    window.addEventListener('wheel', function (e) {
        e.preventDefault();
        var now = Date.now();
        if (now - scrollCooldown < 1200) return;
        scrollCooldown = now;
        if (e.deltaY > 0) navigateToSection(currentSection + 1);
        else if (e.deltaY < 0) navigateToSection(currentSection - 1);
    }, { passive: false });

    // Keyboard
    window.addEventListener('keydown', function (e) {
        if (['ArrowDown', 'PageDown', ' '].indexOf(e.key) !== -1) {
            e.preventDefault();
            navigateToSection(currentSection + 1);
        } else if (['ArrowUp', 'PageUp'].indexOf(e.key) !== -1) {
            e.preventDefault();
            navigateToSection(currentSection - 1);
        }
    });

    // Touch
    var touchStartY = 0;
    window.addEventListener('touchstart', function (e) { touchStartY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchend', function (e) {
        var diff = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(diff) > 50) navigateToSection(currentSection + (diff > 0 ? 1 : -1));
    }, { passive: true });

    /* ========== PARALLAX ENGINE ========== */
    function initParallax() {
        window.addEventListener('mousemove', function (e) {
            var section = allSections[currentSection];
            if (!section) return;
            var cx = (e.clientX / window.innerWidth - 0.5) * 2;
            var cy = (e.clientY / window.innerHeight - 0.5) * 2;
            var els = section.querySelectorAll('[data-speed]');
            els.forEach(function (el) {
                var speed = parseFloat(el.dataset.speed) || 0;
                gsap.to(el, {
                    x: cx * speed * 15,
                    y: cy * speed * 10,
                    duration: 0.8,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            });
        });
    }

    /* ========== SECTION ANIMATIONS ========== */
    var sectionAnimated = {};

    function triggerSectionAnimations(index) {
        if (sectionAnimated[index]) return;
        sectionAnimated[index] = true;

        switch (index) {
            case 0: animateIntro(); break;
            case 1: animateLimitation(); break;
            case 2: animateCpuGpu(); break;
            case 3: animateGPU(); break;
            case 4: animateEvolution(); break;
            case 5: animateSphere(); break;
            case 6: animateCooperation(); break;
            case 7: animateData(); break;
            case 8: animateOmniverse(); break;
            case 9: animateJensen(); break;
            case 10: animateFinale(); break;
        }
    }

    function updateProgressBar(index) {
        var progress = (index / (allSections.length - 1)) * 100;
        var bar = document.getElementById('progress-bar');
        if (bar) bar.style.width = progress + '%';
    }

    /* ---- SECTION 0: INTRO ---- */
    function animateIntro() {
        var tl = gsap.timeline();
        tl.to('.brand-block', {
            opacity: 1, y: 0,
            duration: 1,
            ease: 'power3.out'
        })
            .to('.intro-line', {
                opacity: 1, y: 0,
                duration: 0.7,
                stagger: 0.15,
                ease: 'power3.out'
            }, '-=0.3')
            .to('.agenda-item', {
                opacity: 1, y: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: 'back.out(1.5)'
            }, '-=0.2')
            .to('.scroll-hint', {
                opacity: 1, y: 0,
                duration: 0.6
            }, '-=0.1');
    }

    /* ---- SECTION 1: THE LIMITATION ---- */
    function animateLimitation() {
        // Build serial pipeline
        var serialPipeline = document.getElementById('serial-pipeline');
        if (serialPipeline) {
            for (var i = 0; i < 5; i++) {
                var task = document.createElement('div');
                task.className = 'serial-task';
                task.innerHTML = '<div class="task-fill"></div>';
                serialPipeline.appendChild(task);
            }
            // Animate serial tasks one-by-one
            var tasks = serialPipeline.querySelectorAll('.serial-task');
            var taskIndex = 0;
            function processNext() {
                if (taskIndex >= tasks.length) return;
                tasks[taskIndex].classList.add('active');
                setTimeout(function () {
                    tasks[taskIndex].classList.remove('active');
                    tasks[taskIndex].classList.add('done');
                    taskIndex++;
                    setTimeout(processNext, 200);
                }, 800);
            }
            setTimeout(processNext, 600);
        }

        // Build parallel grid
        var parallelGrid = document.getElementById('parallel-grid');
        if (parallelGrid) {
            for (var j = 0; j < 128; j++) {
                var node = document.createElement('div');
                node.className = 'par-node';
                parallelGrid.appendChild(node);
            }
            // Flash all nodes simultaneously after delay
            setTimeout(function () {
                var nodes = parallelGrid.querySelectorAll('.par-node');
                nodes.forEach(function (n, ni) {
                    setTimeout(function () {
                        n.classList.add('active');
                        setTimeout(function () { n.classList.remove('active'); }, 400);
                    }, ni * 5);
                });
                // Repeat in waves
                setInterval(function () {
                    nodes.forEach(function (n, ni) {
                        setTimeout(function () {
                            n.classList.add('active');
                            setTimeout(function () { n.classList.remove('active'); }, 400);
                        }, ni * 5);
                    });
                }, 2000);
            }, 500);
        }

        // Section conclusion
        gsap.to('.section-conclusion', { opacity: 1, y: 0, duration: 0.8, delay: 2 });
    }

    /* ---- SECTION 2: GPU REVOLUTION ---- */
    function animateGPU() {
        var tl = gsap.timeline();
        tl.to('.content-side .section-number', { opacity: 1, duration: 0.3, delay: 0.2 });

        var section = document.getElementById('section-gpu');
        if (section) {
            var contentEls = section.querySelectorAll('.section-title, .section-body, .info-block');
            contentEls.forEach(function (el) {
                gsap.set(el, { opacity: 0, y: 20 });
                tl.to(el, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');
            });
        }
    }

    /* ---- SECTION 3: EVOLUTION TIMELINE ---- */
    function animateEvolution() {
        // Grow timeline line
        var line = document.getElementById('timeline-line');
        if (line) {
            gsap.to(line, { height: '100%', duration: 2, ease: 'power1.inOut' });
        }

        // Stagger timeline items
        gsap.utils.toArray('.tl-item').forEach(function (item, i) {
            gsap.to(item, {
                opacity: 1, y: 0,
                duration: 0.6,
                delay: 0.3 + i * 0.3,
                ease: 'power2.out'
            });
        });
    }

    /* ---- SECTION 4: SPHERE ---- */
    function animateSphere() {
        var gridOverlay = document.querySelector('.sphere-grid-overlay');
        if (gridOverlay) gridOverlay.classList.add('visible');

        gsap.utils.toArray('.spec-item').forEach(function (item, i) {
            gsap.to(item, {
                opacity: 1, y: 0,
                duration: 0.5,
                delay: 0.5 + i * 0.15,
                ease: 'power2.out'
            });
        });

        gsap.to('.section-quote', { opacity: 1, y: 0, duration: 0.8, delay: 1.5 });
    }

    /* ---- SECTION 5: COOPERATION ---- */
    function animateCooperation() {
        var section = document.getElementById('section-cooperation');
        if (section) {
            var contentEls = section.querySelectorAll('.section-title, .section-body, .info-block');
            contentEls.forEach(function (el, i) {
                gsap.set(el, { opacity: 0, y: 20 });
                gsap.to(el, { opacity: 1, y: 0, duration: 0.5, delay: 0.2 + i * 0.15 });
            });
        }

        // Auto-animate chip merge
        gsap.to({ p: 0 }, {
            p: 1,
            duration: 3,
            delay: 1,
            ease: 'power2.inOut',
            onUpdate: function () {
                if (window.NVScenes && window.NVScenes.chipMerge) {
                    window.NVScenes.chipMerge.setProgress(this.targets()[0].p);
                }
            }
        });
    }

    /* ---- SECTION 6: AI FACTORIES ---- */
    function animateData() {
        var section = document.getElementById('section-data');
        if (section) {
            var contentEls = section.querySelectorAll('.section-title, .section-body');
            contentEls.forEach(function (el, i) {
                gsap.set(el, { opacity: 0, y: 20 });
                gsap.to(el, { opacity: 1, y: 0, duration: 0.5, delay: 0.2 + i * 0.12 });
            });
        }
        gsap.utils.toArray('.use-case-row').forEach(function (row, i) {
            gsap.to(row, { opacity: 1, x: 0, duration: 0.5, delay: 0.6 + i * 0.15, ease: 'power2.out' });
        });
    }

    /* ---- SECTION 7: OMNIVERSE ---- */
    function animateOmniverse() {
        var section = document.getElementById('section-omniverse');
        if (section) {
            var contentEls = section.querySelectorAll('.section-title, .section-body');
            contentEls.forEach(function (el, i) {
                gsap.set(el, { opacity: 0, y: 20 });
                gsap.to(el, { opacity: 1, y: 0, duration: 0.5, delay: 0.2 + i * 0.12 });
            });

            var rows = section.querySelectorAll('.use-case-row');
            rows.forEach(function (row, i) {
                gsap.to(row, { opacity: 1, x: 0, duration: 0.5, delay: 0.6 + i * 0.15, ease: 'power2.out' });
            });
        }

        // Build wireframe
        gsap.to({ p: 0 }, {
            p: 1,
            duration: 3,
            delay: 0.5,
            ease: 'power1.inOut',
            onUpdate: function () {
                if (window.NVScenes && window.NVScenes.omniverse) {
                    window.NVScenes.omniverse.setBuildProgress(this.targets()[0].p);
                }
            }
        });
    }

    /* ---- SECTION 8: JENSEN ---- */
    function animateJensen() {
        gsap.to('.jensen-visual', {
            opacity: 1, scale: 1,
            duration: 1.2,
            ease: 'power2.out',
            onStart: function () {
                var outline = document.querySelector('.jacket-outline');
                if (outline) outline.classList.add('drawn');
            }
        });

        gsap.utils.toArray('.strategy-item').forEach(function (item, i) {
            gsap.to(item, { opacity: 1, x: 0, duration: 0.6, delay: 0.8 + i * 0.2, ease: 'power2.out' });
        });
    }

    /* ---- SECTION 2: CPU vs GPU ---- */
    function animateCpuGpu() {
        var tl = gsap.timeline();
        tl.to('.cpu-card', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
            .to('.gpu-card', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
            .to('.strategy-box-container', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.2');
    }

    /* ---- SECTION 10: FINALE ---- */
    function animateFinale() {
        gsap.to('.finale-title', { opacity: 1, y: 0, duration: 0.8 });

        gsap.utils.toArray('.finale-word').forEach(function (word, i) {
            gsap.to(word, {
                opacity: 1, scale: 1, y: 0,
                duration: 0.5,
                delay: 0.5 + i * 0.12,
                ease: 'back.out(1.5)'
            });
        });

        gsap.to('.finale-tagline', { opacity: 1, y: 0, duration: 0.8, delay: 1.5 });

        // SVG Logo Animation
        gsap.to('.finale-logo', { opacity: 1, y: 0, duration: 0.6, delay: 2 });

        var eyePath = document.querySelector('.nvidia-eye-path');
        var eyePupil = document.querySelector('.nvidia-eye-pupil');
        var logoText = document.querySelector('.nvidia-logo-text');

        if (eyePath) {
            var len = eyePath.getTotalLength();
            gsap.set(eyePath, { strokeDasharray: len, strokeDashoffset: len });
            gsap.to(eyePath, { strokeDashoffset: 0, duration: 1.5, delay: 2.2, ease: 'power2.inOut' });
        }

        if (eyePupil) {
            gsap.fromTo(eyePupil, { scale: 0, transformOrigin: 'center' },
                { scale: 1, duration: 0.5, delay: 3.5, ease: 'back.out(1.7)' });
        }

        if (logoText) {
            gsap.fromTo(logoText, { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 1, delay: 2.8, ease: 'power2.out' });
        }

        gsap.to('.finale-thankyou', { opacity: 1, y: 0, duration: 0.8, delay: 4, ease: 'power2.out' });
    }

    /* ========== INIT ========== */
    function init() {
        gsap.registerPlugin(ScrollTrigger);
        if (typeof ScrollToPlugin !== 'undefined') {
            gsap.registerPlugin(ScrollToPlugin);
        }

        updateLoader(10, 'Loading resources...');

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () {
                updateLoader(20, 'Fonts loaded');
            });
        }

        updateLoader(30, 'Initializing...');
        initParallax();

        setTimeout(function () {
            updateLoader(90, 'Almost ready...');
            setTimeout(function () {
                updateLoader(100, 'Welcome');
                setTimeout(function () {
                    if (loader) loader.classList.add('hidden');
                    // Trigger first section animations
                    sectionAnimated[0] = true;
                    setTimeout(animateIntro, 400);
                }, 600);
            }, 500);
        }, 1500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
