document.getElementById('year').textContent = new Date().getFullYear();

  // Typing effect
  const target = "Bora Baser";
  const typedEl = document.getElementById('typed-text');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(prefersReduced){
    typedEl.textContent = target;
  } else {
    let i = 0;
    (function type(){
      if(i <= target.length){
        typedEl.textContent = target.slice(0, i);
        i++;
        setTimeout(type, 85);
      }
    })();
  }

  // Interactive particle network canvas
  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  let particles = [];
  const mouse = { x: null, y: null, active: false };

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function initParticles(){
    const density = Math.min(90, Math.floor((w * h) / 16000));
    particles = Array.from({ length: density }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6
    }));
  }

  function step(){
    ctx.clearRect(0, 0, w, h);

    const linkDist = 130;
    const mouseLinkDist = 190;

    for(let i = 0; i < particles.length; i++){
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if(p.x < 0 || p.x > w) p.vx *= -1;
      if(p.y < 0 || p.y > h) p.vy *= -1;

      if(mouse.active){
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < mouseLinkDist){
          const force = (1 - dist / mouseLinkDist) * 0.03;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      // speed damping so it doesn't run away
      p.vx *= 0.995;
      p.vy *= 0.995;
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if(speed < 0.06){
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(226, 165, 61, 0.65)';
      ctx.fill();
    }

    for(let i = 0; i < particles.length; i++){
      for(let j = i + 1; j < particles.length; j++){
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < linkDist){
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = 'rgba(92, 188, 174, ' + (0.22 * (1 - dist / linkDist)) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      if(mouse.active){
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < mouseLinkDist){
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = 'rgba(226, 165, 61, ' + (0.28 * (1 - dist / mouseLinkDist)) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    if(!prefersReduced){
      requestAnimationFrame(step);
    }
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener('mouseleave', () => { mouse.active = false; });
  window.addEventListener('touchmove', e => {
    if(e.touches[0]){
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  }, { passive: true });
  window.addEventListener('touchend', () => { mouse.active = false; });

  resize();
  if(prefersReduced){
    step(); // draw one static frame
  } else {
    requestAnimationFrame(step);
  }
