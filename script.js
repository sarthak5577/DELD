/* ============================================================
   script.js — Smart Factory Logic: TTL vs CMOS
   ============================================================ */

'use strict';

/* ── UTILITY ─────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── 1. PROGRESS BAR ─────────────────────────────────────── */
function initProgress() {
  const bar = $('#progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = max > 0 ? (window.scrollY / max * 100) + '%' : '0%';
  }, { passive: true });
}

/* ── 2. NAVBAR ───────────────────────────────────────────── */
function initNavbar() {
  const navbar  = $('#navbar');
  const burger  = $('#nav-burger');
  const mobileMenu = $('#mobile-menu');
  const navLinks = $$('.nav-link');

  // Hamburger toggle
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const spans = $$('span', burger);
      if (mobileMenu.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });
    // Close on link click
    $$('a', mobileMenu).forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        spans && spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }

  // Active link on scroll
  const sections = $$('section[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => observer.observe(s));
}

/* ── 3. SCROLL REVEAL ────────────────────────────────────── */
function initScrollReveal() {
  const els = $$('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

/* ── 4. HERO FACTORY SVG ─────────────────────────────────── */
function buildHeroFactory() {
  const svg = $('#hero-factory-svg');
  if (!svg) return;

  // Already built in HTML, just animate signal dots
  animateHeroSignals();
}

function animateHeroSignals() {
  const paths = $$('.hero-signal-path');
  paths.forEach((path, i) => {
    const len = path.getTotalLength ? path.getTotalLength() : 100;
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    path.style.animation = `waveform-anim ${1.8 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`;
  });
}

/* ── 5. PROBLEM SECTION FACTORY ──────────────────────────── */
function buildProblemFactory() {
  const canvas = $('#problem-factory');
  if (!canvas) return;
  // Signal animations handled by CSS SVG
}

/* ── 6. WAVEFORM (Propagation Delay) ─────────────────────── */
function buildWaveform() {
  const svg = $('#waveform-svg');
  if (!svg) return;
  // Animate the output waveform
  const outputPath = $('#waveform-output');
  if (outputPath) {
    const len = 400;
    outputPath.style.strokeDasharray = len;
    outputPath.style.strokeDashoffset = len;
    outputPath.style.animation = 'waveform-anim 3s linear infinite';
  }
}

/* ── 7. FAN-IN SIGNAL ANIMATION ──────────────────────────── */
function animateFanIn() {
  const paths = $$('.fanin-line');
  paths.forEach((p, i) => {
    p.style.strokeDasharray = '60';
    p.style.strokeDashoffset = '60';
    p.style.animation = `input-flow 1.5s ease ${i * 0.25}s infinite`;
  });
}

/* ── 8. FAN-OUT SIGNAL ANIMATION ─────────────────────────── */
function animateFanOut() {
  const paths = $$('.fanout-line');
  paths.forEach((p, i) => {
    p.style.strokeDasharray = '80';
    p.style.strokeDashoffset = '80';
    p.style.animation = `input-flow 1.8s ease ${i * 0.2}s infinite`;
  });
}

/* ── 9. COMPARE TABLE FILTER ─────────────────────────────── */
function initCompareTable() {
  const compareBtn = $('#compare-btn');
  const tableSection = $('#compare-table-section');
  const filterBtns = $$('.filter-btn');

  const rowCategories = {
    'supply-voltage': 'voltage',
    'vih': 'voltage',
    'vil': 'voltage',
    'voh': 'voltage',
    'vol': 'voltage',
    'input-current': 'current',
    'propagation-delay': 'speed',
    'temperature-range': 'temperature',
    'static-current': 'power',
  };

  if (compareBtn && tableSection) {
    compareBtn.addEventListener('click', () => {
      tableSection.style.display = tableSection.style.display === 'none' ? 'block' : 'none';
      compareBtn.textContent = tableSection.style.display === 'none' ? '⚡ Compare Technologies' : '✕ Hide Comparison';
      if (tableSection.style.display === 'block') {
        tableSection.style.animation = 'fadeInUp 0.4s ease';
      }
      // highlight IC cards
      $$('.ic-card').forEach(c => c.classList.toggle('active'));
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      $$('tbody tr[data-cat]').forEach(row => {
        if (cat === 'all') {
          row.classList.remove('row-highlight');
          row.style.opacity = '1';
        } else if (row.dataset.cat === cat) {
          row.classList.add('row-highlight');
          row.style.opacity = '1';
        } else {
          row.classList.remove('row-highlight');
          row.style.opacity = '0.35';
        }
      });
    });
  });
}

/* ── 10. NOISE MARGIN CALCULATOR ─────────────────────────── */
function initNMCalc() {
  const calcBtn = $('#nm-calc-btn');
  const resetBtn = $('#nm-reset-btn');
  const result = $('#nm-result');

  if (!calcBtn) return;

  calcBtn.addEventListener('click', () => {
    const voh = parseFloat($('#nm-voh').value);
    const vih = parseFloat($('#nm-vih').value);
    const vil = parseFloat($('#nm-vil').value);
    const vol = parseFloat($('#nm-vol').value);

    if (isNaN(voh) || isNaN(vih) || isNaN(vil) || isNaN(vol)) {
      alert('Please enter all four values to calculate.');
      return;
    }

    const nmh = (voh - vih).toFixed(4);
    const nml = (vil - vol).toFixed(4);

    $('#nm-result-high').textContent = nmh + ' V';
    $('#nm-result-low').textContent  = nml + ' V';
    result.classList.add('visible');
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      ['#nm-voh', '#nm-vih', '#nm-vil', '#nm-vol'].forEach(id => $(id).value = '');
      result.classList.remove('visible');
    });
  }
}

/* ── 11. FAN-OUT CALCULATOR ──────────────────────────────── */
function initFanOutCalc() {
  const calcBtn = $('#fo-calc-btn');
  const resetBtn = $('#fo-reset-btn');
  const result = $('#fo-result');

  if (!calcBtn) return;

  calcBtn.addEventListener('click', () => {
    const ioh = parseFloat($('#fo-ioh').value);
    const iih = parseFloat($('#fo-iih').value);
    const iol = parseFloat($('#fo-iol').value);
    const iil = parseFloat($('#fo-iil').value);

    if (isNaN(ioh) || isNaN(iih) || isNaN(iol) || isNaN(iil)) {
      alert('Please enter all four current values to calculate.');
      return;
    }
    if (iih === 0 || iil === 0) {
      alert('Input current values cannot be zero.');
      return;
    }

    const foh = Math.floor(Math.abs(ioh) / Math.abs(iih));
    const fol = Math.floor(Math.abs(iol) / Math.abs(iil));
    const fmin = Math.min(foh, fol);

    $('#fo-result-high').textContent = foh;
    $('#fo-result-low').textContent  = fol;
    $('#fo-result-min').textContent  = fmin;
    result.classList.add('visible');
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      ['#fo-ioh', '#fo-iih', '#fo-iol', '#fo-iil'].forEach(id => $(id).value = '');
      result.classList.remove('visible');
    });
  }
}

/* ── 12. CONVEYOR BELT ANIMATION ─────────────────────────── */
function initConveyor() {
  // SVG conveyor animation is handled by CSS
}

/* ── 13. HERO SIGNAL DOTS ────────────────────────────────── */
function initSignalDots() {
  const containers = $$('.signal-container');
  containers.forEach(container => {
    setInterval(() => {
      const dot = document.createElement('div');
      dot.className = 'signal-dot';
      const startX = parseInt(container.dataset.startX || 0);
      const startY = parseInt(container.dataset.startY || 50);
      const endX = parseInt(container.dataset.endX || 100);
      const endY = parseInt(container.dataset.endY || 50);
      dot.style.left = startX + '%';
      dot.style.top = startY + 'px';
      container.appendChild(dot);
      const duration = 1200 + Math.random() * 600;
      dot.animate([
        { left: startX + '%', top: startY + 'px', opacity: 1 },
        { left: endX + '%', top: endY + 'px', opacity: 0.3 }
      ], { duration, easing: 'linear', fill: 'forwards' })
        .onfinish = () => dot.remove();
    }, 800);
  });
}

/* ── 14. NOISE ANIMATION ─────────────────────────────────── */
function initNoiseAnimation() {
  const noiseEls = $$('.noise-element');
  noiseEls.forEach((el, i) => {
    el.style.animation = `noise-jitter ${0.3 + Math.random() * 0.3}s ease-in-out ${i * 0.1}s infinite`;
  });
}

/* ── 15. DECISION FLOW ANIMATION ─────────────────────────── */
function initDecisionFlow() {
  const steps = $$('.decision-step');
  let current = 0;
  function highlightNext() {
    steps.forEach((s, i) => {
      s.style.borderColor = '';
      s.style.color = '';
      s.style.background = '';
    });
    if (steps[current]) {
      steps[current].style.borderColor = 'var(--accent-cyan)';
      steps[current].style.color = 'var(--accent-cyan)';
      steps[current].style.background = 'rgba(0,229,255,0.06)';
    }
    current = (current + 1) % steps.length;
  }
  if (steps.length > 0) {
    setInterval(highlightNext, 1200);
  }
}

/* ── 16. TRADEOFF ITEM STAGGER ───────────────────────────── */
function initTradeoffs() {
  const items = $$('.tradeoff-item');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const i = items.indexOf(e.target);
        e.target.style.transitionDelay = (i * 0.07) + 's';
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  items.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-12px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    io.observe(el);
  });
}

/* ── 17. IC CARD HOVER ───────────────────────────────────── */
function initICCards() {
  $$('.ic-card').forEach(card => {
    card.addEventListener('click', function() {
      $$('.ic-card').forEach(c => c.classList.remove('active'));
      this.classList.toggle('active');
    });
  });
}

/* ── 18. WAVEFORM SVG BUILDER ────────────────────────────── */
function buildWaveformSVG() {
  const svg = document.getElementById('waveform-svg');
  if (!svg) return;
  // The SVG is built inline in HTML
}

/* ── 19. REQUIREMENT CARD HOVER ──────────────────────────── */
function initRequirementCards() {
  $$('.req-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const icon = $('.req-icon', card);
      if (icon) icon.style.animation = 'glow-pulse 0.8s ease infinite';
    });
    card.addEventListener('mouseleave', () => {
      const icon = $('.req-icon', card);
      if (icon) icon.style.animation = '';
    });
  });
}

/* ── 20. SMOOTH SCROLL FOR ALL ANCHOR LINKS ──────────────── */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        const offset = 72;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      }
    });
  });
}

/* ── 21. FACTORY NODE BLINKING ───────────────────────────── */
function initFactoryNodes() {
  const nodes = $$('.factory-node');
  nodes.forEach((node, i) => {
    node.style.animation = `pulse-dot ${1.5 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`;
  });
}

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initProgress();
  initNavbar();
  initScrollReveal();
  buildHeroFactory();
  buildProblemFactory();
  buildWaveform();
  animateFanIn();
  animateFanOut();
  initCompareTable();
  initNMCalc();
  initFanOutCalc();
  initConveyor();
  initSignalDots();
  initNoiseAnimation();
  initDecisionFlow();
  initTradeoffs();
  initICCards();
  buildWaveformSVG();
  initRequirementCards();
  initSmoothScroll();
  initFactoryNodes();
});
