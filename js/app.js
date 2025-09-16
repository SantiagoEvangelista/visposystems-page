// helper: throttle
function throttle(fn, wait) {
  let last = 0; return function(...args){ const now = Date.now(); if (now - last >= wait) { last = now; fn.apply(this, args); } };
}

// 3D tilt for hero image (subtle)
(function initTilt(){
  const wrap = document.getElementById('tiltWrap');
  const img = document.getElementById('productImg');
  if(!wrap || !img) return;
  const onMove = throttle((e)=>{
    const rect = wrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    img.style.transform = `rotateX(${(-y*6).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) translateZ(0)`;
  }, 16);
  wrap.addEventListener('mousemove', onMove);
  wrap.addEventListener('mouseleave', ()=>{ img.style.transform = 'none'; });
})();

// Carousel logic + ensure videos play/pause only when visible
(function initCarousel(){
  const car = document.getElementById('carousel');
  if(!car) return;
  const cards = Array.from(car.querySelectorAll('.card'));

  // Scroll buttons
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const scrollAmount = () => car.clientWidth * 0.88;
  prevBtn && prevBtn.addEventListener('click', ()=> car.scrollBy({left: -scrollAmount(), behavior:'smooth'}));
  nextBtn && nextBtn.addEventListener('click', ()=> car.scrollBy({left: scrollAmount(), behavior:'smooth'}));

  // Improve focus/keyboard accessibility
  cards.forEach(c => c.setAttribute('tabindex','0'));
})();

// Play/pause videos only when visible
(function initVideoAutoplay(){
  const car = document.getElementById('carousel');
  if(!car) return;
  const vids = Array.from(car.querySelectorAll('video'));
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      const el = entry.target;
      if(!(el instanceof HTMLVideoElement)) return;
      if(entry.isIntersecting){ el.play().catch(()=>{}); } else { el.pause(); }
    });
  }, { threshold: 0.6 });
  vids.forEach(v => io.observe(v));
// Debug: confirm fade-in animation starts
document.getElementById('productImg').addEventListener('animationstart', (e) => {
  console.log('Fade-in animation started for productImg');
});
})();

// GSAP ScrollTrigger to show/hide nav on scroll
(function(){
  if (typeof window === 'undefined' || !window.gsap) return;
  const gsapRef = window.gsap;
  gsapRef.registerPlugin(window.ScrollTrigger);

  const nav  = document.querySelector('.nav');
  const hero = document.querySelector('.hero');
  if (!nav || !hero) return;

  gsapRef.set(nav, { y: 0 });
  let hidden = false;
  const heroBottomAbs = () => {
    const r = hero.getBoundingClientRect();
    return r.top + window.scrollY + r.height;
  };

  function showNav(){
    if (!hidden) return;
    hidden = false;
    gsapRef.to(nav, { y: 0, autoAlpha: 1, duration: 0.25, ease: 'power2.out' });
  }
  function hideNav(){
    if (hidden) return;
    hidden = true;
    gsapRef.to(nav, { y: '-100%', autoAlpha: 0.9, duration: 0.25, ease: 'power2.in' });
  }

  gsapRef.delayedCall(0.05, () => {
    window.ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => {
        const y = window.scrollY || window.pageYOffset || 0;
        const dir = self.direction; // 1 down, -1 up
        if (dir === -1) {
          showNav();
        } else {
          if (y > heroBottomAbs() - 10) hideNav(); else showNav();
        }
      }
    });
  });

  ['resize','orientationchange'].forEach(evt => {
    window.addEventListener(evt, () => gsapRef.delayedCall(0.05, () => window.ScrollTrigger.refresh()));
  });
})();

// Divider expand when entering following section
(function initDividers(){
  if (typeof window === 'undefined' || !window.gsap) return;
  const gsapRef = window.gsap; gsapRef.registerPlugin(window.ScrollTrigger);
  const dividers = Array.from(document.querySelectorAll('.section-divider'));
  dividers.forEach((divider) => {
    gsapRef.set(divider, { scaleX: 0, transformOrigin: '50% 50%' });
    // Use the next element sibling (likely the section that follows the divider) as the trigger
    const triggerEl = divider.nextElementSibling || divider;
    gsapRef.to(divider, {
      scaleX: 1,
      duration: 2.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: triggerEl, start: 'top 85%', toggleActions: 'play none none reverse' }
    });
  });
})();

// 1) TRACE EACH .v-divider VERTICALLY ON SCROLL
document.querySelectorAll('.v-divider').forEach((divider) => {
  // Ensure starting state is collapsed
  gsap.set(divider, { transformOrigin: 'top center', scaleY: 0 });

  gsap.to(divider, {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: divider,
      // Start when the divider's top hits near the bottom of the viewport
      start: 'top 90%',
      // Fully traced when the divider's bottom reaches about 25% from top
      end: 'bottom 25%',
      scrub: true,
    },
  });
});

// 2) BRIDGE TEXT: PROGRESSIVE WORD-BY-WORD HIGHLIGHT
const bridge = document.querySelector('.bridge-text');
if (bridge) {
  // Safely wrap words for animation
  const raw = bridge.textContent;
  const parts = raw.split(/(\s+)/); // keep spaces as separate tokens
  const rebuilt = parts
    .map((token) => {
      if (/^\s+$/.test(token)) {
        return `<span class="word space">${token}</span>`;
      }
      const clean = token.replace(/[^\p{L}\p{N}'’-]/gu, '').toLowerCase();
      const isEW = clean === 'electronic' || clean === 'warfare';
      return `<span class="word${isEW ? ' ew' : ''}">${token}</span>`;
    })
    .join('');
  bridge.innerHTML = rebuilt;

  const allWords = Array.from(bridge.querySelectorAll('.word:not(.space)'));
  const ewWords = Array.from(bridge.querySelectorAll('.word.ew'));
  const nonEWWords = allWords.filter((w) => !w.classList.contains('ew'));

  // Initial state: muted color
  gsap.set(allWords, { color: 'var(--bridge-muted, rgba(255,255,255,0.4))' });

  // Main progressive highlight for the whole sentence → to white
  gsap.to(nonEWWords, {
    color: 'var(--bridge-strong, #ffffff)',
    ease: 'none',
    stagger: {
      each: 0.03, // controls how "swept" the highlight feels
      from: 'start',
    },
    scrollTrigger: {
      trigger: bridge,
      // Lower activation: begin near bottom of screen
      start: 'top 85%',
      end: 'bottom 20%',
      scrub: true,
    },
  });

  // Special earlier highlight for "electronic warfare" → to #7EC5D9
  // Starts even lower (so earlier in the scroll)
  gsap.to(ewWords, {
    color: '#7EC5D9',
    ease: 'none',
    stagger: {
      each: 0.03,
      from: 'start',
    },
    scrollTrigger: {
      trigger: bridge,
      start: 'top 95%', // earlier than the main line
      end: 'bottom 20%',
      scrub: true,
    },
  });
}

// Collapsible mobile nav
(function () {
  const header = document.querySelector('header.nav');
  if (!header) return;
  const toggle = header.querySelector('.nav-toggle');
  const menu = header.querySelector('#site-menu');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!header.classList.contains('is-open'));
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) setOpen(false);
  });

  // Close when a menu link is clicked
  menu.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) setOpen(false);
  });

  // Close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 821px)').matches) setOpen(false);
  });
})();