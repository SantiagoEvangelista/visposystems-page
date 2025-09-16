(function () {
  if (typeof window === 'undefined' || !window.gsap) return;

  const gsapRef = window.gsap;
  gsapRef.registerPlugin(window.ScrollTrigger);

  const section  = document.querySelector('.product_features');
  const pf       = document.getElementById('pf');
  const list     = document.getElementById('pfList');
  const items    = list ? Array.from(list.querySelectorAll('.pf-item')) : [];
  const box      = document.getElementById('pfBox');
  const drone    = document.getElementById('pfDrone');
  const wavesWrap= document.getElementById('pfWaves');

  if (!section || !pf || !list || items.length === 0 || !box || !drone || !wavesWrap) return;

  // Colors
  const rootStyle   = getComputedStyle(document.documentElement);
  const ACTIVE_COLOR= (rootStyle.getPropertyValue('--text')  || '#ffffff').trim();
  const MUTED_COLOR = (rootStyle.getPropertyValue('--muted') || 'rgba(255,255,255,0.35)').trim();

  // Initial states
  gsapRef.set(box,   { autoAlpha: 1, y: 0 });
  gsapRef.set(drone, { autoAlpha: 0, y: 12, right: '28%' });

  // Split bullets into letters once
  const lettersMap = new Map();
  items.forEach((li) => {
    if (li.dataset.splitLetters === 'true') return;
    const text = li.textContent || '';
    li.textContent = '';
    const frag = document.createDocumentFragment();
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (/\s/.test(ch)) {
        frag.appendChild(document.createTextNode(ch));
      } else {
        const span = document.createElement('span');
        span.className = 'pf-letter';
        span.textContent = ch;
        span.style.color = (getComputedStyle(document.documentElement).getPropertyValue('--text') || '#fff').trim();
        span.style.opacity = '0.2';
        frag.appendChild(span);
      }
    }
    li.appendChild(frag);
    li.dataset.splitLetters = 'true';
    lettersMap.set(li, Array.from(li.querySelectorAll('.pf-letter')));
  });

  // Helpers: geometry
  function getCenter(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 + window.scrollX, y: r.top + r.height / 2 + window.scrollY };
  }
  function getDroneAnchor() {
    const r = drone.getBoundingClientRect();
    return { x: r.left + r.width * 0.5 + window.scrollX, y: r.top + r.height * 0.5 + window.scrollY };
  }

  // RF waves (faster, earlier)
  function makeWaveEl() {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'absolute',
      borderRadius: '50%', border: '2px solid rgba(0,180,255,0.55)',
      boxShadow: '0 0 0 1px rgba(0,180,255,0.15)',
      transform: 'translate(-50%, -50%) scale(0.2)', opacity: 0,
      left: '0px', top: '0px'
    });
    return el;
  }

  let wavesTl = null;
  function startWaves() {
    stopWaves();
    wavesWrap.innerHTML = '';

    const origin   = getCenter(box);
    const wrapRect = wavesWrap.getBoundingClientRect();
    const wrapPage = { x: wrapRect.left + window.scrollX, y: wrapRect.top + window.scrollY };
    const localX   = origin.x - wrapPage.x;
    const localY   = origin.y - wrapPage.y;

    const rings = [120, 180, 240, 300, 360, 440, 640, 700].map((size) => {
      const el = makeWaveEl();
      el.style.left = localX + 'px';
      el.style.top  = localY + 'px';
      el.style.width = el.style.height = size + 'px';
      wavesWrap.appendChild(el);
      return el;
    });

    // wave-driven drone reveal for step 1
    gsapRef.set(drone, { autoAlpha: 0 });

    wavesTl = gsapRef.timeline({ repeat: -1, defaults: { ease: 'none' } });
    const droneAnchor = () => getDroneAnchor();

    const dur = 1.4;     // keep previous timing
    const gap = 0.22;    // keep previous timing
    const pre = 0.35;    // keep previous timing

    rings.forEach((el, i) => {
      const t = i * gap;
      wavesTl
        .fromTo(el, { scale: 0.15, opacity: 0 }, { scale: 1, opacity: 0.9, duration: dur, onUpdate: () => {
          const dA = droneAnchor();
          const ringRect = el.getBoundingClientRect();
          const ringCenter = { x: ringRect.left + ringRect.width / 2, y: ringRect.top + ringRect.height / 2 };
          const ringRadius = (ringRect.width / 2) * gsapRef.getProperty(el, 'scale');
          const dx = (dA.x - window.scrollX) - ringCenter.x;
          const dy = (dA.y - window.scrollY) - ringCenter.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= ringRadius && gsapRef.getProperty(el, 'opacity') > 0.5) {
            gsapRef.to(drone, { autoAlpha: 1, duration: 0.2, overwrite: 'auto' });
          }
        } }, t)
        .to(el, { opacity: 0, duration: 0.35 }, t + (dur - 0.25));
    });

    wavesTl.progress(pre % 1);
  }
  function stopWaves() {
    if (wavesTl) wavesTl.kill();
    wavesTl = null;
    wavesWrap.innerHTML = '';
  }

  // Highlight logic (letters opacity)
  function applyHighlight(targetIndex, direction) {
    items.forEach((li, i) => {
      const letters = lettersMap.get(li) || [];
      const isPast = i < targetIndex;
      const isFuture = i > targetIndex;
      if (isPast) {
        gsapRef.set(li, { opacity: 0.9 });
        gsapRef.set(letters, { opacity: 0.9 });
      } else if (isFuture) {
        gsapRef.set(li, { opacity: 0.35 });
        gsapRef.set(letters, { opacity: 0.2 });
      } else {
        if (direction === 'backward') {
          gsapRef.set(li, { opacity: 0.35 });
          gsapRef.set(letters, { opacity: 0.2 });
        }
        gsapRef.to(li, { opacity: 0.9, duration: 0.4, overwrite: 'auto' });
        gsapRef.to(letters, {
          opacity: 0.9,
          duration: 0.25,
          stagger: 0.02,
          ease: 'none',
          overwrite: 'auto'
        });
      }
    });
  }

  // Master timeline with hysteresis snapping
  const steps = 4;
  const points = [0, 1/3, 2/3, 1];
  let currentStep = 0;
  let lastProgress = 0;

  const master = gsapRef.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: `+=${(steps - 1) * 100}%`,
      scrub: 0.2,
      pin: pf,
      anticipatePin: 1,
      snap: {
        snapTo: (raw) => {
          const forwardMid = currentStep < points.length - 1 ? (points[currentStep] + points[currentStep + 1]) / 2 : 1;
          const backwardMid = currentStep > 0 ? (points[currentStep - 1] + points[currentStep]) / 2 : 0;
          if (raw > forwardMid && currentStep < points.length - 1) currentStep++;
          else if (raw < backwardMid && currentStep > 0) currentStep--;
          return points[currentStep];
        },
        duration: 0.3, ease: 'power1.inOut', inertia: false
      },
      onUpdate: (self) => {
        const p = self.progress;
        const dir = p > lastProgress ? 'forward' : 'backward';
        lastProgress = p;

        const forwardMid = currentStep < points.length - 1 ? (points[currentStep] + points[currentStep + 1]) / 2 : 1;
        const backwardMid = currentStep > 0 ? (points[currentStep - 1] + points[currentStep]) / 2 : 0;

        let newIdx = currentStep;
        if (p > forwardMid && currentStep < points.length - 1) newIdx = currentStep + 1;
        else if (p < backwardMid && currentStep > 0) newIdx = currentStep - 1;

        if (newIdx !== currentStep) {
          const prev = currentStep;
          currentStep = newIdx;
          onStepChange(newIdx, prev, dir);
          applyHighlight(newIdx, dir);
        }
      },
      onEnter: () => { onStepChange(0, 0, 'forward'); applyHighlight(0, 'forward'); },
      onLeave: () => stopWaves(),
    }
  });

  master.addLabel('step1').to({}, { duration: 1 })
        .addLabel('step2').to({}, { duration: 1 })
        .addLabel('step3').to({}, { duration: 1 })
        .addLabel('step4');

  // Click-to-scroll for sidebar items (use existing `points`)
  function scrollToStep(idx){
    const st = master.scrollTrigger;
    if (!st) return;
    const clamped = Math.max(0, Math.min(points.length - 1, idx));
    const target = st.start + (st.end - st.start) * points[clamped];
    gsapRef.to(window, { duration: 0.6, ease: 'power2.out', scrollTo: target });
  }
  items.forEach((li, i) => {
    li.style.cursor = 'pointer';
    li.addEventListener('click', (e) => { e.preventDefault(); scrollToStep(i); });
  });

  // Drone loop for step 2
  let droneLoopTl = null;
  function startDroneLoop() {
    stopDroneLoop();
    const stageEl = wavesWrap.closest('.pf-stage') || wavesWrap;
    const stageRect = stageEl.getBoundingClientRect();
    const droneRect = drone.getBoundingClientRect();
    const deltaLeft = droneRect.left - stageRect.left;
    const needed = -(deltaLeft + droneRect.width + 16);

    droneLoopTl = gsapRef.timeline({ repeat: -1 });
    droneLoopTl
      .set(drone, { x: 0, autoAlpha: 1 })
      .to({}, { duration: 0.4 }) // small hold before moving
      .to(drone, { x: needed, duration: 2.2, ease: 'power1.in' })
      .to(drone, { autoAlpha: 0, duration: 0.25 }, '-=0.2')
      .set(drone, { x: 0 });
  }
  function stopDroneLoop() {
    if (droneLoopTl) droneLoopTl.kill();
    droneLoopTl = null;
  }

  // Orbit helpers (satellite loops right to left)
  let orbitGroup; let satelliteEl; let orbitTL;
  function createOrbit() {
    if (!wavesWrap) return null;
    let svg = wavesWrap.querySelector('svg#pf-orbit-svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('id', 'pf-orbit-svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('preserveAspectRatio', 'none');
      Object.assign(svg.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' });
      wavesWrap.appendChild(svg);
    }
    let g = svg.querySelector('g#pf-orbit');
    if (!g) {
      g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', 'pf-orbit');
      g.setAttribute('stroke', 'rgba(74,74,74,0.5)');
      g.setAttribute('stroke-width', '0.35');
      g.setAttribute('fill', 'none');
      svg.appendChild(g);
    } else {
      g.setAttribute('stroke', 'rgba(74,74,74,0.5)');
      g.setAttribute('stroke-width', '0.35');
    }
    let path = g.querySelector('#pf-orbit-path');
    if (!path) {
      path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('id', 'pf-orbit-path');
      g.appendChild(path);
    }

    // Top-most shallow arc spanning full width
    const y = 6; // near the top edge
    const xRight = 99, xLeft = 1;
    const c1x = xRight - 22, c2x = xLeft + 22, cy = Math.max(0, y - 6);
    const d = `M ${xRight} ${y} C ${c1x} ${cy}, ${c2x} ${cy}, ${xLeft} ${y}`;
    path.setAttribute('d', d);

    orbitGroup = g;
    return { svg, path };
  }

  function startOrbit() {
    stopOrbit();
    const o = createOrbit(); if (!o) return;
    if (!satelliteEl) {
      satelliteEl = document.createElement('img');
      satelliteEl.src = 'assets/satellite.png';
      satelliteEl.alt = 'satellite';
      Object.assign(satelliteEl.style, { position: 'absolute', width: '32px', height: 'auto', pointerEvents: 'none', zIndex: 3, opacity: '0' });
      wavesWrap.appendChild(satelliteEl);
    }
    const path = orbitGroup.querySelector('#pf-orbit-path');
    const total = path.getTotalLength();
    const setAt = (t) => {
      const p = path.getPointAtLength(total * t);
      satelliteEl.style.left = (p.x / 100 * wavesWrap.clientWidth - 8) + 'px';
      satelliteEl.style.top  = (p.y / 100 * wavesWrap.clientHeight - 8) + 'px';
    };

    orbitTL = gsapRef.timeline({ repeat: -1 });
    orbitTL
      .set({}, {}, 0)
      .call(() => { setAt(0); })
      .to(satelliteEl, { autoAlpha: 1, duration: 0.2, ease: 'power1.out' }, 0)
      .to({ t: 0 }, { t: 1, duration: 3.6, ease: 'none', onUpdate: function(){ setAt(this.targets()[0].t); } }, 0)
      .to(satelliteEl, { autoAlpha: 0, duration: 0.2, ease: 'none' }, '>-0.05')
      .to({}, { duration: 0.3 });
  }

  function stopOrbit() {
    if (orbitTL) orbitTL.kill();
    orbitTL = null;
    if (satelliteEl && satelliteEl.parentNode) satelliteEl.parentNode.removeChild(satelliteEl);
    satelliteEl = null;
    const svg = wavesWrap.querySelector('svg#pf-orbit-svg'); if (svg) svg.remove();
    orbitGroup = null;
  }

  function onStepChange(newIdx, oldIdx, dir) {
    if (newIdx === 0) {
      // Step 1: reset drone to right and let waves reveal it
      gsapRef.set(box,   { autoAlpha: 1, y: 0 });
      gsapRef.set(drone, { autoAlpha: 0, y: 0, x: 0 });
      stopDroneLoop();
      startWaves();
      if (typeof stopOrbit === 'function') stopOrbit();
    } else if (newIdx === 1) {
      // Move drone slightly down (closer to box) and start loop
      stopWaves();
      gsapRef.set(drone, { x: 0, y: 14, autoAlpha: 1 });
      if (typeof startOrbit === 'function') startOrbit();
      startDroneLoop();
    } else {
      stopWaves();
      stopDroneLoop();
      if (typeof stopOrbit === 'function') stopOrbit();
      gsapRef.set(box, { autoAlpha: 1 });
    }
  }

  ;['resize','orientationchange'].forEach(evt => {
    window.addEventListener(evt, () => {
      if (currentStep === 0) startWaves();
      gsapRef.delayedCall(0.05, () => ScrollTrigger.refresh());
    });
  });

  list.setAttribute('role', 'list');
  items.forEach((li) => li.setAttribute('role', 'listitem'));
})();
