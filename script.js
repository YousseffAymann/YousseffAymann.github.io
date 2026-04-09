/* ============================================================
   PORTFOLIO — PC BOOT → OS DESKTOP (Enhanced)
   Boot, single-click icons, windows, dragging, tabs,
   project details, contact form, progress bars, taskbar, clock
   ============================================================ */

(function () {
    'use strict';

    // ── DOM ─────────────────────────────────────────────────────
    const bootScreen = document.getElementById('bootScreen');
    const bootText = document.getElementById('bootText');
    const bootProgressBar = document.getElementById('bootProgressBar');
    const desktop = document.getElementById('desktop');
    const desktopIcons = document.getElementById('desktopIcons');
    const taskbarApps = document.getElementById('taskbarApps');
    const taskbarClock = document.getElementById('taskbarClock');

    // ── State ───────────────────────────────────────────────────
    let highestZ = 10;
    const openWindows = new Set();

    const appMeta = {
        about: { name: 'About Me', icon: '👤' },
        projects: { name: 'Projects', icon: '📁' },
        skills: { name: 'Skills', icon: '⚙️' },
        experience: { name: 'Experience', icon: '💼' },
        contact: { name: 'Contact', icon: '✉️' },
        cv: { name: 'CV', icon: '📄' },
        help: { name: 'Help', icon: '❓' },
    };

    const defaultPositions = {
        about: { xOff: -80, yOff: -60 },
        projects: { xOff: -30, yOff: -40 },
        skills: { xOff: 20, yOff: -20 },
        experience: { xOff: 60, yOff: 0 },
        contact: { xOff: -40, yOff: 20 },
        cv: { xOff: 40, yOff: -50 },
        help: { xOff: 0, yOff: 30 },
    };

    // ── Init ────────────────────────────────────────────────────
    function init() {
        runBootSequence();
        bindDesktopIcons();
        bindWindowControls();
        bindSkillTabs();
        bindPastEducation();
        bindProjectCards();
        bindProjectCarousels();
        bindContactForm();
        bindCVDownload();
        bindLightboxModal();
        startClock();
    }

    // ============================================================
    // 1. BOOT SEQUENCE
    // ============================================================
    function runBootSequence() {
        const bootLines = bootText.querySelectorAll('.boot-line');
        const totalDuration = 3200;

        bootLines.forEach(line => {
            const delay = parseInt(line.dataset.delay, 10) || 0;
            setTimeout(() => line.classList.add('visible'), delay);
        });

        const steps = [
            { time: 0, w: '0%' }, { time: 400, w: '15%' },
            { time: 900, w: '35%' }, { time: 1500, w: '55%' },
            { time: 2100, w: '75%' }, { time: 2700, w: '90%' },
            { time: 3100, w: '100%' },
        ];
        steps.forEach(s => setTimeout(() => bootProgressBar.style.width = s.w, s.time));

        setTimeout(() => {
            bootScreen.classList.add('hidden');
            desktop.classList.add('visible');
        }, totalDuration + 400);
    }

    // ============================================================
    // 2. DESKTOP ICONS — Single Click
    // ============================================================
    function bindDesktopIcons() {
        const icons = desktopIcons.querySelectorAll('.desktop-icon');

        icons.forEach(icon => {
            // Single click opens
            icon.addEventListener('click', () => {
                icons.forEach(i => i.classList.remove('selected'));
                icon.classList.add('selected');
                openApp(icon.dataset.app);
            });

            // Keyboard
            icon.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') openApp(icon.dataset.app);
            });
        });

        // Click empty area to deselect
        document.querySelector('.desktop-area').addEventListener('click', (e) => {
            if (!e.target.closest('.desktop-icon')) {
                icons.forEach(i => i.classList.remove('selected'));
            }
        });
    }

    // ============================================================
    // 3. WINDOW MANAGEMENT
    // ============================================================
    function openApp(appId) {
        const win = document.getElementById('window-' + appId);
        if (!win) return;

        if (openWindows.has(appId)) {
            focusWindow(win);
            return;
        }

        positionWindow(win, appId);
        openWindows.add(appId);
        win.classList.add('open');
        focusWindow(win);
        addTaskbarIndicator(appId);

        // Animate skill bars if skills window
        if (appId === 'skills') {
            animateSkillBars(win.querySelector('.skill-tab-panel.active'));
        }
    }

    function closeApp(appId) {
        const win = document.getElementById('window-' + appId);
        if (!win) return;
        win.classList.add('closing');
        setTimeout(() => {
            win.classList.remove('open', 'closing');
            openWindows.delete(appId);
            removeTaskbarIndicator(appId);
        }, 200);
    }

    function focusWindow(win) {
        highestZ++;
        win.style.zIndex = highestZ;
        const appId = win.dataset.app;
        taskbarApps.querySelectorAll('.taskbar-app-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.app === appId);
        });
    }

    function positionWindow(win, appId) {
        if (window.innerWidth <= 768) return;
        const offsets = defaultPositions[appId] || { xOff: 0, yOff: 0 };
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const ww = win.offsetWidth || 580;
        const wh = win.offsetHeight || 400;
        const x = Math.max(16, Math.min(vw - ww - 16, (vw - ww) / 2 + offsets.xOff));
        const y = Math.max(16, Math.min(vh - wh - 64, (vh - wh) / 2 + offsets.yOff));
        win.style.left = x + 'px';
        win.style.top = y + 'px';
    }

    function bindWindowControls() {
        document.querySelectorAll('.app-window').forEach(win => {
            const titlebar = win.querySelector('.window-titlebar');
            const closeBtn = win.querySelector('.window-close-btn');
            const appId = win.dataset.app;

            closeBtn.addEventListener('click', () => closeApp(appId));
            win.addEventListener('mousedown', () => focusWindow(win));
            makeDraggable(win, titlebar);
        });
    }

    // ── Draggable ──────────────────────────────────────────────
    function makeDraggable(win, handle) {
        let isDragging = false;
        let startX, startY, origX, origY;

        handle.addEventListener('mousedown', (e) => {
            if (window.innerWidth <= 768) return;
            if (e.target.closest('.window-close-btn')) return;
            isDragging = true;
            startX = e.clientX; startY = e.clientY;
            origX = win.offsetLeft; origY = win.offsetTop;
            focusWindow(win);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            win.style.left = Math.max(0, Math.min(window.innerWidth - 80, origX + e.clientX - startX)) + 'px';
            win.style.top = Math.max(0, Math.min(window.innerHeight - 80, origY + e.clientY - startY)) + 'px';
        });
        document.addEventListener('mouseup', () => isDragging = false);

        // Touch
        handle.addEventListener('touchstart', (e) => {
            if (window.innerWidth <= 768) return;
            if (e.target.closest('.window-close-btn')) return;
            const t = e.touches[0];
            isDragging = true;
            startX = t.clientX; startY = t.clientY;
            origX = win.offsetLeft; origY = win.offsetTop;
            focusWindow(win);
        }, { passive: true });
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const t = e.touches[0];
            win.style.left = Math.max(0, origX + t.clientX - startX) + 'px';
            win.style.top = Math.max(0, origY + t.clientY - startY) + 'px';
        }, { passive: true });
        document.addEventListener('touchend', () => isDragging = false);
    }

    // ============================================================
    // 4. SKILL TABS + PROGRESS BARS
    // ============================================================
    function bindSkillTabs() {
        const tabBar = document.getElementById('skillTabs');
        if (!tabBar) return;

        tabBar.addEventListener('click', (e) => {
            const tab = e.target.closest('.skill-tab');
            if (!tab) return;
            const tabId = tab.dataset.tab;

            // Switch tab buttons
            tabBar.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Switch panels
            const window = tabBar.closest('.app-window');
            window.querySelectorAll('.skill-tab-panel').forEach(p => p.classList.remove('active'));
            const panel = document.getElementById('tab-' + tabId);
            if (panel) {
                panel.classList.add('active');
                animateSkillBars(panel);
            }
        });
    }

    function animateSkillBars(panel) {
        if (!panel) return;
        const bars = panel.querySelectorAll('.skill-bar-fill');
        // Reset then animate
        bars.forEach(bar => bar.style.width = '0%');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                bars.forEach(bar => {
                    const level = bar.dataset.level || '0';
                    bar.style.width = level + '%';
                });
            });
        });
    }

    // ============================================================
    // 4.5 PAST EDUCATION TOGGLE
    // ============================================================
    function bindPastEducation() {
        const toggle = document.getElementById('pastEduToggle');
        const content = document.getElementById('pastEduContent');
        if (!toggle || !content) return;

        toggle.addEventListener('click', () => {
            toggle.classList.toggle('open');
            content.classList.toggle('open');
        });
    }

    // ============================================================
    // 5. PROJECT CARDS → DETAIL VIEW
    // ============================================================
    function bindProjectCards() {
        const projectsList = document.getElementById('projectsList');
        if (!projectsList) return;

        // Click a project card
        projectsList.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            if (!card) return;
            const projectId = card.dataset.project;
            const detail = document.getElementById('detail-' + projectId);
            if (!detail) return;

            projectsList.style.display = 'none';
            detail.classList.add('active');
        });

        // Back buttons
        document.querySelectorAll('.project-detail-back').forEach(btn => {
            btn.addEventListener('click', () => {
                const detail = btn.closest('.project-detail');
                detail.classList.remove('active');
                projectsList.style.display = 'block';
            });
        });
    }

    // ============================================================
    // 5.5 PROJECT IMAGE CAROUSELS
    // ============================================================
    function bindProjectCarousels() {
        document.querySelectorAll('.project-carousel').forEach(carousel => {
            const track = carousel.querySelector('.carousel-track');
            const slides = carousel.querySelectorAll('.carousel-slide');
            const prevBtn = carousel.querySelector('.carousel-arrow-prev');
            const nextBtn = carousel.querySelector('.carousel-arrow-next');
            const dotsContainer = carousel.querySelector('.carousel-dots');
            const dots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];
            let current = 0;
            const total = slides.length;

            function goTo(index) {
                if (index < 0) index = total - 1;
                if (index >= total) index = 0;
                current = index;
                track.style.transform = `translateX(-${current * 100}%)`;
                dots.forEach((d, i) => d.classList.toggle('active', i === current));
            }

            if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
            if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
            dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
        });
    }

    // ============================================================
    // 6. CONTACT FORM
    // ============================================================
    function bindContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = form.querySelector('#contactName').value.trim();
            const email = form.querySelector('#contactEmail').value.trim();
            const message = form.querySelector('#contactMessage').value.trim();

            if (!name || !email || !message) return;

            // Open mailto with prefilled data
            const subject = encodeURIComponent('Portfolio Contact from ' + name);
            const body = encodeURIComponent('From: ' + name + '\nEmail: ' + email + '\n\n' + message);
            window.open('mailto:youssef@example.com?subject=' + subject + '&body=' + body);

            // Visual feedback
            const btn = form.querySelector('.contact-form-btn');
            const origText = btn.textContent;
            btn.textContent = '✓ Sent!';
            btn.style.background = '#4caf50';
            setTimeout(() => {
                btn.textContent = origText;
                btn.style.background = '';
                form.reset();
            }, 2000);
        });
    }

    // ============================================================
    // 7. CV — PDF is now embedded via <object>, download via <a download>
    // ============================================================
    function bindCVDownload() {
        // CV actions are now handled natively by HTML links
        // (download attribute and target="_blank")
    }

    // ============================================================
    // 7.5 IMAGE LIGHTBOX MODAL
    // ============================================================
    function bindLightboxModal() {
        const modal = document.getElementById('imageModal');
        if (!modal) return;
        const modalImg = document.getElementById('imageModalImg');
        const closeBtn = document.getElementById('imageModalClose');
        const prevBtn = document.getElementById('imageModalPrev');
        const nextBtn = document.getElementById('imageModalNext');

        let currentSlides = [];
        let currentIndex = 0;

        function openModal(slides, index) {
            currentSlides = slides;
            currentIndex = index;
            updateModalImage();
            modal.classList.add('active');
        }

        function closeModal() {
            modal.classList.remove('active');
            setTimeout(() => { modalImg.src = ''; }, 300);
        }

        function updateModalImage() {
            if (!currentSlides.length) return;
            const img = currentSlides[currentIndex].querySelector('img');
            if (img) modalImg.src = img.src;
        }

        function nextImage() {
            if (!currentSlides.length) return;
            currentIndex = (currentIndex + 1) % currentSlides.length;
            updateModalImage();
        }

        function prevImage() {
            if (!currentSlides.length) return;
            currentIndex = (currentIndex - 1 + currentSlides.length) % currentSlides.length;
            updateModalImage();
        }

        // Add clicks to all carousel images
        document.querySelectorAll('.project-carousel').forEach(carousel => {
            const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
            slides.forEach((slide, index) => {
                const img = slide.querySelector('img');
                if (img) {
                    img.style.cursor = 'zoom-in';
                    img.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openModal(slides, index);
                    });
                }
            });
        });

        closeBtn.addEventListener('click', closeModal);
        nextBtn.addEventListener('click', nextImage);
        prevBtn.addEventListener('click', prevImage);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('active')) return;
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        });
    }

    // ============================================================
    // 8. TASKBAR
    // ============================================================
    function addTaskbarIndicator(appId) {
        if (taskbarApps.querySelector(`[data-app="${appId}"]`)) return;
        const meta = appMeta[appId];
        if (!meta) return;

        const btn = document.createElement('button');
        btn.className = 'taskbar-app-btn active';
        btn.dataset.app = appId;
        btn.innerHTML = `<span class="taskbar-app-icon">${meta.icon}</span><span>${meta.name}</span>`;
        btn.addEventListener('click', () => {
            const win = document.getElementById('window-' + appId);
            if (win) focusWindow(win);
        });
        taskbarApps.appendChild(btn);

        taskbarApps.querySelectorAll('.taskbar-app-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.app === appId);
        });
    }

    function removeTaskbarIndicator(appId) {
        const btn = taskbarApps.querySelector(`[data-app="${appId}"]`);
        if (btn) btn.remove();
    }

    // ── Clock ──────────────────────────────────────────────────
    function startClock() {
        updateClock();
        setInterval(updateClock, 1000);
    }
    function updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const date = now.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
        taskbarClock.innerHTML = `<div class="taskbar-time">${time}</div><div>${date}</div>`;
    }

    // ── Start ──────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', init);
})();
