/* ============================================================
   SOLAR SYSTEM — script.js
   All logic, animations, controls, and interactivity live here.
   ============================================================ */

/* ─────────────────────────────────────────────────────────────
   PLANET DATA
   ───────────────────────────────────────────────────────────── */
const PLANET_DATA = {
  Mercury: {
    distance: '58M km', diameter: '4,879 km', period: '88 days', moons: '0',
    fact: 'Smallest planet — just slightly larger than Earth\'s Moon.',
    tagline: 'Smallest planet',
    sphere: 'radial-gradient(circle at 35% 35%, #d4c5b0, #8a7a6e 60%, #5a4e44)',
    glow: '#d4c5b0',
  },
  Venus: {
    distance: '108M km', diameter: '12,104 km', period: '225 days', moons: '0',
    fact: 'Hottest planet — surface temperature reaches 465°C, hotter than Mercury.',
    tagline: 'Hottest planet',
    sphere: 'radial-gradient(circle at 35% 35%, #ffe8a0, #e8b840 50%, #c0852a)',
    glow: '#e8b840',
  },
  Earth: {
    distance: '150M km', diameter: '12,742 km', period: '365 days', moons: '1',
    fact: 'The only known planet to harbor life, with liquid water covering 71% of its surface.',
    tagline: 'Supports life',
    sphere: 'radial-gradient(circle at 35% 30%, #7ac9f0, #2a7fd4 40%, #1a4a8a 70%, #2a7f3a 90%)',
    glow: '#3890e0',
  },
  Mars: {
    distance: '228M km', diameter: '6,779 km', period: '687 days', moons: '2',
    fact: 'Home to Olympus Mons, the tallest volcano in the solar system at 21 km high.',
    tagline: 'Red planet',
    sphere: 'radial-gradient(circle at 35% 35%, #e8805a, #c04030 55%, #8a2820)',
    glow: '#cc4030',
  },
  Jupiter: {
    distance: '778M km', diameter: '139,820 km', period: '12 years', moons: '95+',
    fact: 'Largest planet — 1,300 Earths could fit inside. The Great Red Spot is a storm raging for 350+ years.',
    tagline: 'Largest planet',
    sphere: 'radial-gradient(circle at 35% 35%, #f0e0c0, #d8b880 30%, #b89060 55%, #a07840 80%)',
    glow: '#d0a870',
    isJupiter: true,
  },
  Saturn: {
    distance: '1.4B km', diameter: '116,460 km', period: '29 years', moons: '140+',
    fact: 'Its spectacular ring system spans 282,000 km in diameter, yet is only 10 m thick on average.',
    tagline: 'Ring system',
    sphere: 'radial-gradient(circle at 35% 35%, #f0dca0, #d4b870 45%, #a88840 80%)',
    glow: '#d4b870',
    hasRing: true,
  },
  Uranus: {
    distance: '2.9B km', diameter: '50,724 km', period: '84 years', moons: '27',
    fact: 'Rotates on its side with an axial tilt of 98°. Effectively rolls around the Sun.',
    tagline: 'Rotates sideways',
    sphere: 'radial-gradient(circle at 35% 35%, #b0e8f0, #60c0d0 50%, #308898)',
    glow: '#60c0d0',
  },
  Neptune: {
    distance: '4.5B km', diameter: '49,244 km', period: '165 years', moons: '14',
    fact: 'Wind speeds can exceed 2,100 km/h — the fastest in the solar system.',
    tagline: 'Fast winds',
    sphere: 'radial-gradient(circle at 35% 35%, #8090f8, #3848d8 50%, #1828a0)',
    glow: '#3848d8',
  },
};

/* ─────────────────────────────────────────────────────────────
   ORBIT SPEEDS (degrees per frame at 60fps, speed multiplier = 1)
   Real-world relative: Mercury fastest, Neptune slowest
   ───────────────────────────────────────────────────────────── */
const BASE_SPEEDS = {
  Mercury: 0.42,
  Venus:   0.22,
  Earth:   0.14,
  Mars:    0.09,
  Jupiter: 0.032,
  Saturn:  0.018,
  Uranus:  0.010,
  Neptune: 0.006,
};

/* ─────────────────────────────────────────────────────────────
   STATE
   ───────────────────────────────────────────────────────────── */
let isPaused    = false;
let speedMult   = 1;
let zoomLevel   = 1;
let angles      = { Mercury: 0, Venus: 60, Earth: 120, Mars: 200, Jupiter: 45, Saturn: 150, Uranus: 270, Neptune: 330 };
let rafId       = null;
let lastTime    = 0;
let particles   = [];

/* ─────────────────────────────────────────────────────────────
   STAR CANVAS BACKGROUND
   ───────────────────────────────────────────────────────────── */
function initStars() {
  const canvas = document.getElementById('starCanvas');
  const ctx    = canvas.getContext('2d');
  let stars    = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    generateStars();
  }

  function generateStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 4000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        r:       Math.random() * 1.6 + 0.2,
        alpha:   Math.random() * 0.7 + 0.15,
        speed:   Math.random() * 0.004 + 0.001,
        phase:   Math.random() * Math.PI * 2,
      });
    }
    generateParticles(canvas);
  }

  function drawStars(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Deep space gradient
    const grad = ctx.createRadialGradient(
      canvas.width * 0.6, canvas.height * 0.3, 0,
      canvas.width * 0.6, canvas.height * 0.3, canvas.width * 0.9
    );
    grad.addColorStop(0,   'rgba(20,40,100,0.3)');
    grad.addColorStop(0.5, 'rgba(10,20,60,0.2)');
    grad.addColorStop(1,   'rgba(2,8,24,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const s of stars) {
      const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    }

    // Floating particles
    for (const p of particles) {
      p.x += Math.cos(p.dir) * p.v;
      p.y += Math.sin(p.dir) * p.v;
      p.life -= 0.002;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      if (p.life <= 0) resetParticle(p, canvas);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.life * 0.5})`;
      ctx.fill();
    }
  }

  function loop(t) {
    drawStars(t * 0.001);
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(loop);
}

/* ─────────────────────────────────────────────────────────────
   PARTICLE GENERATION
   ───────────────────────────────────────────────────────────── */
function generateParticles(canvas) {
  particles = [];
  for (let i = 0; i < 80; i++) {
    particles.push(createParticle(canvas));
  }
}

function createParticle(canvas) {
  const colors = ['140,180,255', '240,180,41', '180,220,255', '255,200,120'];
  return {
    x:     Math.random() * (canvas ? canvas.width : window.innerWidth),
    y:     Math.random() * (canvas ? canvas.height : window.innerHeight),
    r:     Math.random() * 1.2 + 0.3,
    v:     Math.random() * 0.3 + 0.05,
    dir:   Math.random() * Math.PI * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    life:  Math.random() * 0.6 + 0.2,
  };
}

function resetParticle(p, canvas) {
  const colors = ['140,180,255', '240,180,41', '180,220,255', '255,200,120'];
  p.x     = Math.random() * (canvas ? canvas.width : window.innerWidth);
  p.y     = Math.random() * (canvas ? canvas.height : window.innerHeight);
  p.r     = Math.random() * 1.2 + 0.3;
  p.v     = Math.random() * 0.3 + 0.05;
  p.dir   = Math.random() * Math.PI * 2;
  p.color = colors[Math.floor(Math.random() * colors.length)];
  p.life  = Math.random() * 0.6 + 0.2;
}

/* ─────────────────────────────────────────────────────────────
   ORBITAL ANIMATION (JavaScript-driven rotation)
   ───────────────────────────────────────────────────────────── */
function getWrapper(planet) {
  const cls = planet.toLowerCase();
  return document.querySelector(`.${cls}-wrapper`);
}

function getOrbitRadius(planet) {
  const radii = {
    Mercury: 60, Venus: 88, Earth: 119, Mars: 150,
    Jupiter: 191, Saturn: 230, Uranus: 271, Neptune: 311,
  };
  return radii[planet];
}

function animateOrbits(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min(timestamp - lastTime, 50); // cap dt for tab-switch jitter
  lastTime = timestamp;

  if (!isPaused) {
    for (const planet of Object.keys(BASE_SPEEDS)) {
      angles[planet] += BASE_SPEEDS[planet] * speedMult * (dt / 16.67);
      const rad    = (angles[planet] * Math.PI) / 180;
      const radius = getOrbitRadius(planet);
      const x      = Math.cos(rad) * radius;
      const y      = Math.sin(rad) * radius;

      const wrapper = getWrapper(planet);
      if (wrapper) {
        wrapper.style.transform = `translate(${x}px, ${y}px)`;
      }
    }
  }

  rafId = requestAnimationFrame(animateOrbits);
}

/* ─────────────────────────────────────────────────────────────
   PLAY / PAUSE
   ───────────────────────────────────────────────────────────── */
function initPlayPause() {
  const btn       = document.getElementById('playPauseBtn');
  const pauseIcon = document.getElementById('pauseIcon');
  const playIcon  = document.getElementById('playIcon');

  btn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseIcon.style.display = isPaused ? 'none'  : 'block';
    playIcon.style.display  = isPaused ? 'block' : 'none';
    btn.style.borderColor   = isPaused ? 'rgba(240,180,41,0.6)' : '';
  });
}

/* ─────────────────────────────────────────────────────────────
   SPEED SLIDER
   ───────────────────────────────────────────────────────────── */
function initSpeedControl() {
  const slider = document.getElementById('speedSlider');
  const label  = document.getElementById('speedVal');

  slider.addEventListener('input', () => {
    speedMult = parseFloat(slider.value);
    label.textContent = speedMult.toFixed(1) + 'x';
  });
}

/* ─────────────────────────────────────────────────────────────
   ZOOM
   ───────────────────────────────────────────────────────────── */
function initZoom() {
  const sys = document.getElementById('solarSystem');

  document.getElementById('zoomInBtn').addEventListener('click', () => {
    zoomLevel = Math.min(zoomLevel + 0.15, 2);
    sys.style.transform = `translate(-50%,-50%) scale(${zoomLevel})`;
  });

  document.getElementById('zoomOutBtn').addEventListener('click', () => {
    zoomLevel = Math.max(zoomLevel - 0.15, 0.4);
    sys.style.transform = `translate(-50%,-50%) scale(${zoomLevel})`;
  });

  // Scroll wheel zoom on the viewport
  const viewport = document.getElementById('solarViewport');
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoomLevel = Math.max(0.4, Math.min(2, zoomLevel - e.deltaY * 0.001));
    sys.style.transform = `translate(-50%,-50%) scale(${zoomLevel})`;
  }, { passive: false });
}

/* ─────────────────────────────────────────────────────────────
   PLANET CLICK → MODAL
   ───────────────────────────────────────────────────────────── */
function initPlanetClick() {
  const overlay   = document.getElementById('modalOverlay');
  const modalName = document.getElementById('modalName');
  const modalTag  = document.getElementById('modalTagline');
  const modalGrid = document.getElementById('modalGrid');
  const modalFun  = document.getElementById('modalFun');
  const modalSph  = document.getElementById('modalSphere');
  const modalGlow = document.getElementById('modalGlow');
  const modalRing = document.getElementById('modalRingWrap');
  const closeBtn  = document.getElementById('modalClose');

  function openModal(name) {
    const d = PLANET_DATA[name];
    if (!d) return;

    modalName.textContent = name;
    modalTag.textContent  = d.tagline;
    modalFun.textContent  = '"' + d.fact + '"';

    modalSph.style.background  = d.sphere;
    modalGlow.style.background = d.glow;

    // Jupiter bands
    if (d.isJupiter) {
      modalSph.style.background = `repeating-linear-gradient(
        180deg,
        #f0e0c0 0px, #d8b880 12px, #b89060 20px,
        #c8a060 28px, #a07840 36px, #c09060 44px,
        #f0e0c0 52px
      )`;
      modalSph.style.borderRadius = '50%';
    }

    modalRing.style.display = d.hasRing ? 'flex' : 'none';

    modalSph.style.boxShadow = `0 0 40px 10px ${d.glow}66, 0 0 80px 20px ${d.glow}22`;

    modalGrid.innerHTML = `
      <div class="modal-stat"><span class="modal-stat-label">Distance from Sun</span><span class="modal-stat-value">${d.distance}</span></div>
      <div class="modal-stat"><span class="modal-stat-label">Diameter</span><span class="modal-stat-value">${d.diameter}</span></div>
      <div class="modal-stat"><span class="modal-stat-label">Orbit Period</span><span class="modal-stat-value">${d.period}</span></div>
      <div class="modal-stat"><span class="modal-stat-label">Moons</span><span class="modal-stat-value">${d.moons}</span></div>
    `;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Click on solar system planets
  document.querySelectorAll('.planet').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(el.dataset.planet);
    });
  });

  // Click on planet cards
  document.querySelectorAll('.planet-card').forEach(el => {
    el.addEventListener('click', () => openModal(el.dataset.planet));
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ─────────────────────────────────────────────────────────────
   COUNTER ANIMATION (stats)
   ───────────────────────────────────────────────────────────── */
function animateCounters() {
  const planetsEl = document.getElementById('statPlanets');
  const ageEl     = document.getElementById('statAge');
  const moonsEl   = document.getElementById('statMoons');

  function countTo(el, end, suffix, duration, decimals) {
    let start     = 0;
    const step    = end / (duration / 16);
    const timer   = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      el.textContent = decimals
        ? start.toFixed(1) + suffix
        : Math.floor(start) + suffix;
    }, 16);
  }

  countTo(planetsEl, 8,   '',     1200, false);
  countTo(ageEl,     4.6, 'B',    1600, true);
  countTo(moonsEl,   200, '+',    1800, false);
}

/* ─────────────────────────────────────────────────────────────
   SCROLL ANIMATIONS
   ───────────────────────────────────────────────────────────── */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────────────────────
   SMOOTH SCROLL (Explore button)
   ───────────────────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelector('.btn-explore')?.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector('#planets-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

/* ─────────────────────────────────────────────────────────────
   DYNAMIC STAR GENERATION (additional shooting stars)
   ───────────────────────────────────────────────────────────── */
function initShootingStars() {
  const canvas = document.getElementById('starCanvas');
  const ctx    = canvas.getContext('2d');

  function shoot() {
    const x    = Math.random() * canvas.width;
    const y    = Math.random() * canvas.height * 0.5;
    const len  = Math.random() * 120 + 60;
    const ang  = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
    let alpha  = 0.9;
    let pos    = 0;

    function draw() {
      pos += 12;
      alpha -= 0.025;
      if (alpha <= 0) return;

      const sx = x + Math.cos(ang) * pos;
      const sy = y + Math.sin(ang) * pos;

      ctx.save();
      const grad = ctx.createLinearGradient(sx, sy, sx - Math.cos(ang) * len, sy - Math.sin(ang) * len);
      grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - Math.cos(ang) * len, sy - Math.sin(ang) * len);
      ctx.stroke();
      ctx.restore();

      requestAnimationFrame(draw);
    }

    draw();
    setTimeout(shoot, Math.random() * 5000 + 2000);
  }

  setTimeout(shoot, 2000);
}

/* ─────────────────────────────────────────────────────────────
   PLANET LABEL VISIBILITY (hide/show based on zoom)
   ───────────────────────────────────────────────────────────── */
function initLabelVisibility() {
  const zoomInBtn  = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');

  function updateLabels() {
    const show = zoomLevel >= 0.85;
    document.querySelectorAll('.planet-label').forEach(l => {
      l.style.display = show ? '' : 'none';
    });
  }

  zoomInBtn.addEventListener('click',  updateLabels);
  zoomOutBtn.addEventListener('click', updateLabels);
}

/* ─────────────────────────────────────────────────────────────
   CURSOR GLOW EFFECT
   ───────────────────────────────────────────────────────────── */
function initCursorGlow() {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(240,180,41,0.04) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transition: opacity 0.3s ease;
    transform: translate(-50%,-50%);
    top: 0; left: 0;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

/* ─────────────────────────────────────────────────────────────
   ORBIT SPEED CONTROL (alias for speed slider wiring)
   Already handled in initSpeedControl, but adding direct hook
   for any future external callers.
   ───────────────────────────────────────────────────────────── */
function setOrbitSpeed(multiplier) {
  speedMult = Math.max(0.1, Math.min(5, multiplier));
  const slider = document.getElementById('speedSlider');
  const label  = document.getElementById('speedVal');
  if (slider) slider.value = speedMult;
  if (label)  label.textContent = speedMult.toFixed(1) + 'x';
}

/* ─────────────────────────────────────────────────────────────
   INIT ALL
   ───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initShootingStars();
  initPlayPause();
  initSpeedControl();
  initZoom();
  initPlanetClick();
  initScrollAnimations();
  initSmoothScroll();
  initLabelVisibility();
  initCursorGlow();
  animateCounters();

  // Start orbital animation
  requestAnimationFrame(animateOrbits);
});