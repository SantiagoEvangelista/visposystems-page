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