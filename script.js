'use strict';

// ==============================================================
// Abu Taleb Sadim — interactive portfolio
// All animation is native CSS/Canvas/JS, without a build step.
// Edit contact details in config.js; project data in index.html.
// ==============================================================
const CONFIG = window.PORTFOLIO_CONFIG || {};
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduceMotion = () => prefersReducedMotion.matches;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const lerp = (a, b, t) => a + (b - a) * t;
const yearEl = $('#year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// -- Informative prompts: don't claim an action succeeded without a real integration.
let toastTimer;
function toast(message) {
  const box = $('#toast');
  box.textContent = message;
  box.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove('show'), 4500);
}
function showDialog(title, message) {
  const dialog = $('#infoDialog');
  $('#dialogTitle').textContent = title;
  $('#dialogMessage').textContent = message;
  if (dialog.showModal) dialog.showModal(); else toast(message);
}

// -- Responsive mobile navigation
const menuToggle = $('#menuToggle');
const mobileMenu = $('#mobileMenu');
menuToggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
});
$$('.mobile-menu a, .mobile-menu button').forEach(item => item.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') mobileMenu.classList.remove('open');
});
document.addEventListener('click', event => {
  if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) {
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});

// -- Active navigation, progress bar, and Home-specific staircase
const sections = $$('.page-section');
let visibleSection = 'home';
let scrollScheduled = false;
function refreshNavigation() {
  scrollScheduled = false;
  const y = window.scrollY;
  const targetY = y + window.innerHeight * 0.42;
  let current = sections[0];
  for (const section of sections) {
    if (section.offsetTop <= targetY) current = section;
  }
  visibleSection = current.id;
  $('#siteHeader').classList.toggle('is-inner', visibleSection !== 'home');
  $$('[data-nav]').forEach(el => el.classList.toggle('active', el.dataset.nav === visibleSection));
  const docLength = document.documentElement.scrollHeight - window.innerHeight;
  $('#readingProgress').style.width = `${docLength ? (y / docLength) * 100 : 0}%`;
  updatePortraitTravel();
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) {
    scrollScheduled = true;
    requestAnimationFrame(refreshNavigation);
  }
}, { passive: true });
window.addEventListener('resize', refreshNavigation);

// -- Scroll reveal effects
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
  $$('.reveal,.reveal-left,.reveal-right').forEach(el => revealObserver.observe(el));
} else {
  $$('.reveal,.reveal-left,.reveal-right').forEach(el => el.classList.add('is-visible'));
}

// -- Text typing loop
const roles = ['Software Developer', 'Problem Solver', 'Tech Enthusiast'];
const typingRole = $('#typingRole');
if (!reduceMotion()) {
  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = true;
  function typeStep() {
    const word = roles[roleIndex];
    typingRole.textContent = word.slice(0, charIndex);
    if (deleting) charIndex--; else charIndex++;
    let delay = deleting ? 60 : 92;
    if (charIndex < 0) {
      roleIndex = (roleIndex + 1) % roles.length;
      charIndex = 0;
      deleting = false;
      delay = 350;
    } else if (!deleting && charIndex > roles[roleIndex].length) {
      deleting = true;
      charIndex = roles[roleIndex].length;
      delay = 2300;
    }
    setTimeout(typeStep, delay);
  }
  setTimeout(typeStep, 2900);
}

// -- Controlled, layout-safe portrait journey from Home (right) to About (left).
// Avoid fixed-position duplicate portraits: they can swell across the screen and
// cover text at intermediate scroll positions, especially at browser zoom levels.
const heroPortrait = $('.hero-photo img');
const aboutPortrait = $('.about-photo img');
function updatePortraitTravel() {
  if (!heroPortrait || !aboutPortrait) return;
  if (reduceMotion() || window.innerWidth < 800) {
    heroPortrait.style.transform = '';
    heroPortrait.style.opacity = '';
    aboutPortrait.style.transform = '';
    aboutPortrait.style.opacity = '';
    return;
  }
  const start = $('#home').offsetTop + window.innerHeight * .28;
  const finish = $('#about').offsetTop + window.innerHeight * .36;
  const p = Math.max(0, Math.min(1, (window.scrollY - start) / Math.max(1, finish - start)));
  const ease = p * p * (3 - 2 * p);
  // Motion is confined to each picture's own grid cell, not a fullscreen ghost.
  heroPortrait.style.transform = `translate3d(${-46 * ease}px,0,0) scale(${1 - .075 * ease})`;
  heroPortrait.style.opacity = String(Math.max(0, 1 - ease * 1.45));
  aboutPortrait.style.transform = `translate3d(${58 * (1 - ease)}px,0,0) scale(${.93 + .07 * ease})`;
  aboutPortrait.style.opacity = String(Math.max(0, Math.min(1, ease * 1.8 - .14)));
}
heroPortrait?.addEventListener('load', refreshNavigation);
aboutPortrait?.addEventListener('load', refreshNavigation);

// -- Config-driven links, no invented public profiles or recipient details.
$$('[data-link]').forEach(link => {
  const type = link.dataset.link;
  const uri = type === 'email' && CONFIG.email ? `mailto:${CONFIG.email}` : CONFIG[type];
  if (uri && uri.trim()) {
    link.href = uri;
    if (type !== 'email') {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  } else {
    link.href = '#';
    link.dataset.unconfigured = 'true';
    link.addEventListener('click', event => {
      event.preventDefault();
      toast(`Add your ${type} ${type === 'email' ? 'address' : 'URL'} inside config.js to activate this link.`);
    });
  }
});
$$('[data-resume]').forEach(button => button.addEventListener('click', () => {
  if (CONFIG.resumeUrl && CONFIG.resumeUrl.trim()) {
    const link = document.createElement('a');
    link.href = CONFIG.resumeUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  } else {
    showDialog('Resume is ready for your PDF', 'Add your final CV/Resume PDF to the assets folder and set resumeUrl in config.js. The buttons will then open your real resume.');
  }
}));

// -- Tilt is decorative, never required for navigation.
if (window.matchMedia('(hover:hover) and (pointer:fine)').matches && !reduceMotion()) {
  $$('.tilt-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const box = card.getBoundingClientRect();
      const nx = ((event.clientX - box.left) / box.width - 0.5) * 2;
      const ny = ((event.clientY - box.top) / box.height - 0.5) * 2;
      card.style.transform = `perspective(980px) rotateX(${(-ny * 2.4).toFixed(2)}deg) rotateY(${(nx * 3.1).toFixed(2)}deg) translateY(-2px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

// ==============================================================
// Interactive 3D-ish Skills Solar System — 10 moving planets
// ==============================================================
const techs = [
  { name: 'Python', icon: 'Py', color: '#ffd44b', detail: 'Programming language · Backend, data & automation' },
  { name: 'C', icon: 'C', color: '#8facff', detail: 'Programming language · Fundamentals & systems' },
  { name: 'C++', icon: 'C++', color: '#7db2ff', detail: 'Programming language · OOP & problem solving' },
  { name: 'JavaScript', icon: 'JS', color: '#ffdb3d', detail: 'Programming language · Interactive web apps' },
  { name: 'HTML', icon: '5', color: '#ff7744', detail: 'Markup language · Web structure' },
  { name: 'CSS', icon: '3', color: '#5dc4ff', detail: 'Stylesheets · Responsive interfaces' },
  { name: 'MySQL', icon: 'SQL', color: '#6fd9e9', detail: 'Database · Relational data management' },
  { name: 'JSON', icon: '{}', color: '#dcb1ff', detail: 'Data format · API communication' },
  { name: 'Django', icon: 'dj', color: '#77e6c1', detail: 'Python framework · Backend development' },
  { name: 'ReactJS', icon: '⚛', color: '#62d7ff', detail: 'JavaScript library · Component-based UI' },
];
const universe = $('#universe');
const planetField = $('#planetField');
const planetTooltip = $('#planetTooltip');
const planetNodes = [];
let orbitPaused = reduceMotion();
let planetHoverIndex = -1;
let planetSelectedIndex = -1;
let orbitOffset = 0;
let lastPlanetTick = 0;
let skillsVisible = true;
const orbitToggle = $('#orbitToggle');
orbitToggle.textContent = orbitPaused ? '▶  Resume orbit' : 'Ⅱ  Pause orbit';
orbitToggle.setAttribute('aria-pressed', String(orbitPaused));

techs.forEach((tech, i) => {
  const item = document.createElement('button');
  item.type = 'button';
  item.className = 'planet';
  item.setAttribute('aria-label', `${tech.name}: ${tech.detail}`);
  item.innerHTML = `<span class="planet-icon" style="color:${tech.color}">${tech.icon}</span><span class="planet-label">${tech.name}</span>`;
  item.addEventListener('mouseenter', () => { planetHoverIndex = i; updatePlanetInfo(i); });
  item.addEventListener('mouseleave', () => { planetHoverIndex = -1; if (planetSelectedIndex !== -1) updatePlanetInfo(planetSelectedIndex); });
  item.addEventListener('focus', () => { planetHoverIndex = i; updatePlanetInfo(i); });
  item.addEventListener('blur', () => { planetHoverIndex = -1; });
  item.addEventListener('click', () => {
    planetSelectedIndex = planetSelectedIndex === i ? -1 : i;
    planetNodes.forEach((node, index) => node.classList.toggle('selected', index === planetSelectedIndex));
    updatePlanetInfo(i);
  });
  planetField.appendChild(item);
  planetNodes.push(item);
});
function updatePlanetInfo(i) {
  planetTooltip.innerHTML = `<span>TECHNOLOGY / ${String(i + 1).padStart(2, '0')}</span><b>${techs[i].name}</b><small>${techs[i].detail}</small>`;
}
function updatePlanets() {
  const w = universe.clientWidth;
  const h = universe.clientHeight;
  const isMobile = w < 500;
  const size = clamp(w * 0.118, isMobile ? 62 : 85, isMobile ? 81 : 122);
  const cx = w * .50;
  const cy = h * .51;
  const rx = w * (isMobile ? .395 : .398);
  const ry = h * (isMobile ? .315 : .325);
  techs.forEach((tech, i) => {
    const angle = -Math.PI / 2 + i * Math.PI * 2 / techs.length + orbitOffset;
    const depth = Math.cos(angle + .34);
    const scale = .88 + depth * .18;
    const x = cx + Math.cos(angle) * rx - size / 2;
    const y = cy + Math.sin(angle) * ry - size / 2;
    const item = planetNodes[i];
    item.style.width = `${size}px`;
    item.style.height = `${size}px`;
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;
    item.style.transform = `scale(${scale})`;
    item.style.zIndex = String(Math.round(8 + depth * 3));
    item.style.opacity = String(.84 + (depth + 1) * .07);
  });
}
function planetLoop(now) {
  const dt = clamp(now - (lastPlanetTick || now), 0, 42);
  lastPlanetTick = now;
  if (skillsVisible && !orbitPaused && planetHoverIndex === -1 && planetSelectedIndex === -1) orbitOffset += dt * 0.00019;
  if (skillsVisible) updatePlanets();
  requestAnimationFrame(planetLoop);
}
requestAnimationFrame(planetLoop);
orbitToggle.addEventListener('click', () => {
  orbitPaused = !orbitPaused;
  orbitToggle.textContent = orbitPaused ? '▶  Resume orbit' : 'Ⅱ  Pause orbit';
  orbitToggle.setAttribute('aria-pressed', String(orbitPaused));
});
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => { skillsVisible = entries[0].isIntersecting; }, { rootMargin: '300px' }).observe(universe);
}

// -- Project details. No invented repositories, demos, or completed projects.
$$('[data-project]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.project === 'vista') {
    showDialog('VISTA — Project Overview', 'VISTA is a university academic-management project focused on attendance records, examination seat plans, seat verification, and faculty alerts. The system assigns official corrections to administrators. To add your actual GitHub link, screenshots or demo, edit the Projects section in index.html and config.js.');
  } else {
    showDialog('Customize your portfolio', 'Replace the Upcoming Project or Next Big Idea card in index.html with a real project: title, short problem statement, your role, technologies, screenshot, verified repository URL, and a working demo if available.');
  }
}));

// ==============================================================
// Actual rotating globe drawn on Canvas from public-domain
// Natural Earth coastline polygons. Drag the globe to rotate it.
// ==============================================================
const earthCanvas = $('#earthCanvas');
const earthContext = earthCanvas.getContext('2d', { alpha: true });
const MAP = window.GLOBE_POLYGONS || [];
const cities = [[90.4,23.8],[74,40.7],[-118,34.1],[-0.1,51.5],[2.4,48.9],[77.2,28.6],[139.7,35.7],[121.5,31.2],[103.8,1.35],[-46.6,-23.5],[28.0,-26.2],[151.2,-33.8],[55.3,25.2]];
let globeLon = 54, globeDrag = false, globeLastX = 0;
let globeVisible = true, globeLastFrame = 0;
let globeDpr = 1;
const G_SIZE = 620;
function resizeGlobe() {
  globeDpr = Math.min(window.devicePixelRatio || 1, 2);
  earthCanvas.width = G_SIZE * globeDpr;
  earthCanvas.height = G_SIZE * globeDpr;
  earthContext.setTransform(globeDpr, 0, 0, globeDpr, 0, 0);
}
resizeGlobe();
window.addEventListener('resize', resizeGlobe);
const latitudeTilt = .12;
const latTiltCos = Math.cos(latitudeTilt), latTiltSin = Math.sin(latitudeTilt);
function project(lon, lat, longitudeCenter, radius) {
  const lo = (lon + longitudeCenter) * Math.PI / 180;
  const la = lat * Math.PI / 180;
  const cosLa = Math.cos(la);
  const x = Math.sin(lo) * cosLa;
  const y = Math.sin(la) * latTiltCos - Math.cos(lo) * cosLa * latTiltSin;
  const z = Math.cos(lo) * cosLa * latTiltCos + Math.sin(la) * latTiltSin;
  return [310 + x * radius, 310 - y * radius, z];
}
function globePath(points, rotation, R, ctx) {
  let seen = 0, drawing = false;
  ctx.beginPath();
  for (const [lon, lat] of points) {
    const [x, y, z] = project(lon, lat, rotation, R);
    if (z > .009) {
      if (drawing) ctx.lineTo(x, y);
      else { ctx.moveTo(x, y); drawing = true; }
      seen++;
    } else drawing = false;
  }
  if (seen > 2) { ctx.closePath(); return true; }
  return false;
}
function drawGlobe(rotation) {
  const ctx = earthContext;
  ctx.clearRect(0, 0, G_SIZE, G_SIZE);
  const c = 310, R = 207;
  // Outer radiance
  const glow = ctx.createRadialGradient(c, c, R * .8, c, c, R * 1.37);
  glow.addColorStop(0, '#ad38ff44');glow.addColorStop(1, '#ad38ff00');
  ctx.fillStyle = glow;ctx.beginPath();ctx.arc(c, c, R * 1.38, 0, Math.PI * 2);ctx.fill();
  ctx.save();ctx.beginPath();ctx.arc(c, c, R, 0, Math.PI * 2);ctx.clip();
  // Deep blue layered ocean sphere
  const water = ctx.createRadialGradient(c - 60, c - 80, 20, c + 25, c + 10, R * 1.45);
  water.addColorStop(0, '#315bb3');water.addColorStop(.4, '#143577');water.addColorStop(.72, '#101a4e');water.addColorStop(1, '#05091f');
  ctx.fillStyle = water;ctx.fillRect(c - R, c - R, R * 2, R * 2);
  // Latitude and longitude guides
  ctx.strokeStyle = '#b8d3ff13';ctx.lineWidth = .8;
  [-65,-40,-20,0,20,40,65].forEach(lat => {
    ctx.beginPath();let live=false;
    for (let lon=-180;lon<=180;lon+=3) {
      const [x,y,z]=project(lon,lat,rotation,R);
      if(z>0){ if(live)ctx.lineTo(x,y);else {ctx.moveTo(x,y);live=true;} }else live=false;
    }
    ctx.stroke();
  });
  // Actual geographically positioned continent geometry
  ctx.fillStyle = '#1b7357';ctx.strokeStyle = '#5ed69e88';ctx.lineWidth = .7;
  for (const polygon of MAP) {
    if(globePath(polygon, rotation, R, ctx)){ctx.fill();ctx.stroke();}
  }
  // Soft atmospheric clouds traveling with the Earth
  ctx.strokeStyle = '#c3edff25';ctx.lineWidth=8;ctx.lineCap='round';
  for(let i=0;i<7;i++){
    const lat=Math.sin(i*2.3+rotation*.012)*42;
    const lon=i*53-120;
    const a=project(lon,lat,rotation,R);
    const b=project(lon+14,lat+6,rotation,R);
    if(a[2]>.08&&b[2]>.08){ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2-9,b[0],b[1]);ctx.stroke();}
  }
  // City lights / stars on front-facing continents
  for(let i=0;i<cities.length;i++){
    const [x,y,z]=project(cities[i][0],cities[i][1],rotation,R);
    if(z>0.08){ctx.beginPath();ctx.arc(x,y,1.7,0,Math.PI*2);ctx.fillStyle='#ffcc86';ctx.shadowBlur=12;ctx.shadowColor='#ff9d24';ctx.fill();ctx.shadowBlur=0;}
  }
  // Shading and glass reflection
  const shadow=ctx.createRadialGradient(c-74,c-96,40,c+90,c+60,R*1.45);
  shadow.addColorStop(0,'#b8e9ff21');shadow.addColorStop(.42,'#ffffff00');shadow.addColorStop(.67,'#0b022c24');shadow.addColorStop(1,'#030211d9');
  ctx.fillStyle=shadow;ctx.fillRect(c-R,c-R,2*R,2*R);ctx.restore();
  ctx.strokeStyle='#9b5bff';ctx.lineWidth=3;ctx.shadowBlur=20;ctx.shadowColor='#a94fff';ctx.beginPath();ctx.arc(c,c,R,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;
}
function earthLoop(now) {
  const dt=clamp(now-(globeLastFrame||now),0,60);
  globeLastFrame=now;
  if(globeVisible){
    if(!reduceMotion()&&!globeDrag)globeLon=(globeLon+dt*.011)%360;
    // ~30 fps, throttled for mobile battery
    if(now - (earthLoop.lastDraw||0)>(reduceMotion()?1000:31) || globeDrag){
      drawGlobe(globeLon);
      earthLoop.lastDraw=now;
    }
  }
  requestAnimationFrame(earthLoop);
}
requestAnimationFrame(earthLoop);
if('IntersectionObserver' in window){new IntersectionObserver(entries=>{globeVisible=entries[0].isIntersecting;},{rootMargin:'300px'}).observe(earthCanvas);}
earthCanvas.addEventListener('pointerdown',event=>{globeDrag=true;globeLastX=event.clientX;earthCanvas.setPointerCapture(event.pointerId);});
earthCanvas.addEventListener('pointermove',event=>{if(!globeDrag)return;globeLon+=(event.clientX-globeLastX)*.38;globeLastX=event.clientX;});
['pointerup','pointercancel','lostpointercapture'].forEach(type=>earthCanvas.addEventListener(type,()=>{globeDrag=false;}));

// -- Direct contact form submission through Formspree (no mail-client redirect).
// Create a form in Formspree, then paste its public endpoint in config.js.
const contactForm = $('#contactForm');
const sendButton = contactForm.querySelector('button[type="submit"]');
const formStatus = $('#formStatus');
const defaultSendText = sendButton.textContent;
let contactSubmitting = false;

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (contactSubmitting) return;

  const name = $('#senderName').value.trim();
  const email = $('#senderEmail').value.trim();
  const message = $('#senderMessage').value.trim();
  const endpoint = (CONFIG.formspreeEndpoint || '').trim();

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 8) {
    formStatus.textContent = 'Please enter your name, a valid email address, and a message of at least 8 characters.';
    return;
  }

  // Only submit to an official HTTPS Formspree submission URL.
  // This avoids sending visitor messages to an accidental or mistyped server.
  if (!/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9_-]+\/?$/.test(endpoint)) {
    formStatus.textContent = 'Message sending is not configured yet. The website owner needs to set the Formspree endpoint in config.js.';
    return;
  }

  const formData = new FormData(contactForm);
  formData.set('name', name);
  formData.set('email', email);
  formData.set('message', message);
  formData.set('_subject', `Portfolio inquiry from ${name}`);

  contactSubmitting = true;
  sendButton.disabled = true;
  sendButton.textContent = 'Sending...';
  contactForm.setAttribute('aria-busy', 'true');
  formStatus.textContent = 'Sending your message...';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' }
    });

    if (response.ok) {
      formStatus.textContent = 'Message sent successfully! Thank you for reaching out.';
      contactForm.reset();
    } else if (response.status === 429) {
      formStatus.textContent = 'Too many messages have been submitted. Please wait and try again later.';
    } else {
      // Formspree may include form-level or field-level errors in its JSON response.
      const data = await response.json().catch(() => ({}));
      const serverError = Array.isArray(data.errors)
        ? data.errors.map(item => item.message).filter(Boolean).join(' ')
        : '';
      formStatus.textContent = serverError || 'Your message could not be sent. Please check your details and try again.';
    }
  } catch (error) {
    formStatus.textContent = 'Could not connect to the message service. Check your internet connection and try again.';
  } finally {
    contactSubmitting = false;
    sendButton.disabled = false;
    sendButton.textContent = defaultSendText;
    contactForm.removeAttribute('aria-busy');
  }
});

// -- Everything still works without animation, or if motion is disabled.
refreshNavigation();
