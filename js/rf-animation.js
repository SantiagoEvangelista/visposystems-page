/* rf-animation.js
   Scroll-controlled RF waves + images (GSAP + ScrollTrigger)
*/
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Guard if GSAP isn't loaded
  if (typeof gsap === 'undefined') { console.warn('GSAP not found'); return; }

  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector('#rf-section');
  const stage   = section?.querySelector('.rf-stage');
  const product = document.getElementById('rf-product-img');
  const drone   = document.getElementById('rf-drone-img');
  const group   = document.getElementById('rf-waves-group');

  if (!section || !stage || !product || !drone || !group) return;

  // === CONFIG ===
  const emitFrom = { x: 80, y: 60 }; // where waves originate (viewBox %, right side near product)
  const pulses = 2;                  // number of pulses
  const ringsPerPulse = 4;           // rings per pulse
  const ringSpacing = 8;             // space between rings (SVG units)
  const firstRingRadius = 10;        // starting radius (feels like first wave)
  const expandTo = 140;              // how far rings expand (beyond viewport)
  const pulseGap = 0.6;              // timeline gap between pulses
  const ringStagger = 0.12;          // stagger within a pulse

  // Build initial ring elements
  const rings = [];
  for (let p = 0; p < pulses; p++) {
    for (let i = 0; i < ringsPerPulse; i++) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', emitFrom.x);
      c.setAttribute('cy', emitFrom.y);
      c.setAttribute('r', 0.01);
      c.style.opacity = 0;
      group.appendChild(c);
      rings.push({ el: c, p, i });
    }
  }

  // Helper: prepare intro visibility
  function setIntroState() {
    gsap.set([product], { opacity: 1, y: 0, scale: 1 });
    gsap.set(drone, { opacity: 0, scale: 0.6, filter: 'blur(1.2px)' });
  }

  // Create the master timeline
  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: prefersReduced ? undefined : {
      trigger: section,
      start: 'top top',      // when the RF section hits the top
      end: '+=230%',         // scrub distance
      scrub: 0.6,
      pin: stage,
      anticipatePin: 1
    }
  });

  // Intro: fade in product + copy as soon as section starts
  tl.fromTo(product, { opacity: 0, y: 10, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, 0);

  // Waves: first wave, then equi-spaced rings expanding
  rings.forEach(({ el, p, i }) => {
    const start = p * pulseGap + i * ringStagger + 0.1; // slight delay after product appears
    const targetR = firstRingRadius + i * ringSpacing;

    tl.fromTo(el,
      { r: 0.2, opacity: 0 },
      { r: targetR, opacity: 0.85 - i * 0.15, duration: 0.9 },
      start
    ).to(el,
      { r: expandTo, opacity: 0, duration: 0.9 },
      start + 0.55
    );
  });

  // Drone appears after the waves have clearly started
  const droneAppearAt = pulses * pulseGap + 0.35;
  tl.to(drone,
    { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' },
    droneAppearAt
  ).to(drone,
    { y: -40, duration: 1.4, ease: 'none' }, // subtle parallax drift
    droneAppearAt + 0.6
  );

  // Reduced motion: show final state without pin/scrub
  if (prefersReduced) {
    setIntroState();
    rings.forEach(({ el }) => { el.setAttribute('r', 0.01); el.style.opacity = 0; });
    gsap.set(drone, { opacity: 1, scale: 1, filter: 'blur(0px)' });
  }
})();
