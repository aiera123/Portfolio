/**
 * main.js — Anuradha Dulal Portfolio
 *
 * Modules (all self-contained, no external dependencies):
 *   1. Cursor       — custom dot + lagging ring cursor
 *   2. Navbar       — frosted-glass effect on scroll
 *   3. ThemeToggle  — light/dark mode with localStorage persistence
 *   4. MobileMenu   — hamburger / drawer open & close
 *   5. ScrollReveal — fade-in elements when they enter the viewport
 *   6. SkillBars    — animate progress bars on scroll
 *   7. HeroChips    — staggered entrance for the tech chips
 *   8. ContactForm  — basic validation + mock send with toast
 */

'use strict';


/* ── 1. Cursor ─────────────────────────────────────────────────
   Two elements:
   • #cursor-dot  — snaps to mouse position instantly
   • #cursor-ring — lerp-follows the dot for a lag effect

   The ring grows when hovering interactive elements via
   the .cursor-grow class on <body>.
   ──────────────────────────────────────────────────────────── */
function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  // Skip on touch / very small screens (CSS also hides the elements)
  if (!dot || !ring || window.matchMedia('(max-width: 420px)').matches) return;

  let mouseX = 0, mouseY = 0;   // current mouse position
  let ringX  = 0, ringY  = 0;   // ring's smoothed position

  // Track mouse — move the dot immediately
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Lerp helper — smooth interpolation between two values
  function lerp(from, to, factor) {
    return from + (to - from) * factor;
  }

  // rAF loop — ring chases the dot at 12% per frame
  function animateRing() {
    ringX = lerp(ringX, mouseX, 0.12);
    ringY = lerp(ringY, mouseY, 0.12);
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }

  animateRing();

  // Grow the ring when hovering cards / buttons / links
  const hoverTargets = document.querySelectorAll('a, button, .project-card, .skill-card');

  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-grow'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-grow'));
  });
}


/* ── 2. Navbar ─────────────────────────────────────────────────
   Adds .stuck to #nav once the user scrolls past 50 px,
   which triggers the frosted-glass background in CSS.
   Uses {passive: true} for better scroll performance.
   ──────────────────────────────────────────────────────────── */
function initNavbar() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('stuck', window.scrollY > 50);
  }, { passive: true });
}


/* ── 3. ThemeToggle ────────────────────────────────────────────
   Strategy:
   - Dark is the DEFAULT (no class on body, as defined in :root).
   - Light mode is activated by adding class "light" to <body>.
   - Choice is saved to localStorage under key "portfolio-theme".
   - On load, we check:
       1. localStorage value  (explicit user preference)
       2. prefers-color-scheme  (system preference, first visit only)
       3. Default to dark if neither is set.

   The button icon communicates what clicking WILL DO:
   - Shows 🌙 in dark mode  → "click to go light" (sun comes out)
   - Shows ☀️ in light mode → "click to go dark"  (moon comes out)
   ──────────────────────────────────────────────────────────── */
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const STORAGE_KEY = 'portfolio-theme';
  const DARK_ICON   = '🌙';
  const LIGHT_ICON  = '☀️';

  /**
   * Apply a theme.
   * @param {'dark'|'light'} theme
   * @param {boolean} [persist=true] — whether to save to localStorage
   */
  function applyTheme(theme, persist = true) {
    if (theme === 'light') {
      document.body.classList.add('light');
      btn.textContent          = LIGHT_ICON;
      btn.setAttribute('aria-label', 'Switch to dark mode');
      btn.setAttribute('title',      'Switch to dark mode');
    } else {
      document.body.classList.remove('light');
      btn.textContent          = DARK_ICON;
      btn.setAttribute('aria-label', 'Switch to light mode');
      btn.setAttribute('title',      'Switch to light mode');
    }

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (e) {
        // localStorage may be blocked in some private-browsing environments;
        // silently swallow the error so nothing else breaks.
      }
    }
  }

  /** Toggle between light and dark. */
  function toggleTheme() {
    const isLight = document.body.classList.contains('light');
    applyTheme(isLight ? 'dark' : 'light');
  }

  // ── Determine the initial theme ──────────────────────────────
  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    // Ignore localStorage errors
  }

  if (savedTheme === 'light' || savedTheme === 'dark') {
    // 1. Explicit user preference
    applyTheme(savedTheme, false); // already saved, no need to re-save
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    // 2. System prefers light, and user hasn't overridden yet
    applyTheme('light', false);   // save lazily on first manual toggle
  } else {
    // 3. Default: dark (matches :root in CSS — no body class needed)
    applyTheme('dark', false);
  }

  // Wire up the button
  btn.addEventListener('click', toggleTheme);

  // Optional: respond to live system-preference changes
  // (only applies when the user hasn't explicitly chosen via the button)
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'light' : 'dark', false);
      }
    } catch (_) {
      // localStorage blocked
    }
  });
}


/* ── 4. MobileMenu ─────────────────────────────────────────────
   Toggles .open on both the hamburger button and the full-screen
   drawer. Locks body scroll while the drawer is open.
   Closes when any drawer link is clicked.
   ──────────────────────────────────────────────────────────── */
function initMobileMenu() {
  const ham    = document.getElementById('ham');
  const drawer = document.getElementById('drawer');
  if (!ham || !drawer) return;

  function openMenu() {
    ham.classList.add('open');
    ham.setAttribute('aria-expanded', 'true');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    ham.classList.remove('open');
    ham.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    drawer.classList.contains('open') ? closeMenu() : openMenu();
  }

  ham.addEventListener('click', toggleMenu);

  // Close on any nav link click inside the drawer
  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}


/* ── 5. ScrollReveal ───────────────────────────────────────────
   Uses IntersectionObserver to add .up to elements with
   .sr / .sr-left / .sr-right once they enter the viewport.

   Each element is unobserved after revealing — no wasted cycles.
   ──────────────────────────────────────────────────────────── */
function initScrollReveal() {
  const targets = document.querySelectorAll('.sr, .sr-left, .sr-right');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('up');
        observer.unobserve(entry.target); // fire once only
      }
    });
  }, { threshold: 0.13 });

  targets.forEach((el) => observer.observe(el));
}


/* ── 6. SkillBars ──────────────────────────────────────────────
   Each .bar-fill has a data-w attribute (e.g. data-w="85").
   The bar width stays at 0 until the element scrolls into view,
   then CSS transition animates it to the target percentage.
   ──────────────────────────────────────────────────────────── */
function initSkillBars() {
  const bars = document.querySelectorAll('.bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.w + '%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach((bar) => observer.observe(bar));
}


/* ── 7. HeroChips ──────────────────────────────────────────────
   Gives each tech chip in the hero card a staggered slide-up
   entrance. Delays increase by 80 ms per chip, starting at 600 ms.
   ──────────────────────────────────────────────────────────── */
function initHeroChips() {
  const chips = document.querySelectorAll('.chip');
  if (!chips.length) return;

  const BASE_DELAY = 0.6;   // seconds
  const STEP_DELAY = 0.08;  // seconds between chips

  chips.forEach((chip, index) => {
    const delay = BASE_DELAY + index * STEP_DELAY;

    // Start hidden and offset downward
    chip.style.opacity    = '0';
    chip.style.transform  = 'translateY(12px)';
    chip.style.transition = `opacity 0.5s ${delay}s ease, transform 0.5s ${delay}s ease`;

    // Trigger on next paint so the initial state is applied first
    requestAnimationFrame(() => {
      chip.style.opacity   = '1';
      chip.style.transform = 'translateY(0)';
    });
  });
}


/* ── 8. ContactForm ────────────────────────────────────────────
   Validates name, email, and message fields.
   Simulates an async send (1.4 s delay) then shows a toast.
   Resets the form after 4 s.

   Note: wire this up to a real backend / Formspree / EmailJS
   by replacing the setTimeout block with an actual fetch() call.
   ──────────────────────────────────────────────────────────── */
function initContactForm() {
  const btn   = document.getElementById('sendBtn');
  const toast = document.getElementById('toast');
  if (!btn || !toast) return;

  // Read and trim a field by id
  function field(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  // Reset the form fields back to empty
  function resetFields() {
    ['name', 'email', 'subject', 'message'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }

  btn.addEventListener('click', () => {
    const name    = field('name');
    const email   = field('email');
    const message = field('message');

    if (!name || !email || !message) {
      alert('Please fill in your name, email, and message.');
      return;
    }

    // Show loading state
    btn.disabled  = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';

    // Simulate network delay — replace with real API call here
    setTimeout(() => {
      btn.innerHTML       = '<i class="fa-solid fa-check"></i> Sent!';
      toast.style.display = 'block';

      // Reset after 4 s
      setTimeout(() => {
        btn.disabled        = false;
        btn.innerHTML       = '<i class="fa-solid fa-paper-plane"></i> Send Message';
        toast.style.display = 'none';
        resetFields();
      }, 4000);

    }, 1400);
  });
}


/* ── Bootstrap ─────────────────────────────────────────────────
   Run all modules once the DOM is fully parsed.
   NOTE: initThemeToggle() is first so the correct theme class is
   applied to <body> before any other module or paint occurs,
   preventing a flash of the wrong theme (FOUT).
   ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();   // ← must be first to avoid theme flash
  initCursor();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initSkillBars();
  initHeroChips();
  initContactForm();
});