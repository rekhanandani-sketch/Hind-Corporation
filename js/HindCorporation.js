(function(){
  "use strict";

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* NAV */
  const nav = document.getElementById('nav');
  const onScrollNav = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  onScrollNav();

  const burger = document.getElementById('burger');
  const navlinks = document.getElementById('navlinks');

  if (burger && navlinks) {
    burger.addEventListener('click', () => {
      const open = navlinks.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
    });

    navlinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navlinks.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', false);
      });
    });
  }

  /* TICKER */
  const ticker = document.getElementById('ticker');

  if (ticker) {
    const items = [
      '<span><b>TRADELYTICA</b> <i class="up">▲</i> REAL-TIME MARKET INTELLIGENCE</span>',
      '<span>·</span>',
      '<span><b>DESIGN SETU</b> <i class="di">◆</i> IDEAS → INTERFACES</span>',
      '<span>·</span>',
      '<span>HIND CORPORATION</span>',
      '<span>·</span>',
      '<span><i class="di">◆</i> CRAFTED IN INDIA</span>',
      '<span>·</span>'
    ].join('');

    ticker.innerHTML = items + items;
  }

  /* REVEAL ANIMATION */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {
    threshold:0.18,
    rootMargin:'0px 0px -8% 0px'
  });

  document.querySelectorAll('.reveal, .card').forEach(el=>{
    io.observe(el);
  });

  /* STARFIELD */
  const cv = document.getElementById('stars');

  if(cv){
    const ctx = cv.getContext('2d');

    let W,H,DPR,stars=[],raf=null;

    function sizeStars(){
      DPR = Math.min(2, window.devicePixelRatio || 1);

      W = cv.width = innerWidth * DPR;
      H = cv.height = innerHeight * DPR;

      cv.style.width = innerWidth + 'px';
      cv.style.height = innerHeight + 'px';

      const n = Math.round(innerWidth / 16);

      stars = [];

      for(let i=0;i<n;i++){
        stars.push({
          x:Math.random()*W,
          y:Math.random()*H,
          r:(Math.random()*1.1 + .35) * DPR,
          a:Math.random()*.5 + .18,
          s:(Math.random()*.10 + .015) * DPR,
          tw:Math.random()*Math.PI*2
        });
      }
    }

    function paint(move){
      ctx.clearRect(0,0,W,H);

      for(const st of stars){

        if(move){
          st.y += st.s;

          if(st.y > H){
            st.y = 0;
          }

          st.tw += .02;
        }

        const tw = st.a * (0.6 + 0.4*Math.sin(st.tw));

        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI*2);

        ctx.fillStyle =
          'rgba(120,180,225,' + tw.toFixed(3) + ')';

        ctx.fill();
      }
    }

    function loop(){
      paint(true);
      raf = requestAnimationFrame(loop);
    }

    sizeStars();

    if(reduce){
      paint(false);
    }else{
      loop();
    }

    let rt;

    window.addEventListener('resize', ()=>{
      clearTimeout(rt);

      rt = setTimeout(()=>{
        sizeStars();

        if(reduce){
          paint(false);
        }

        buildThread();
      },160);

    }, {passive:true});
  }

  /* RED THREAD */
  const svg  = document.getElementById('thread');
  const path = document.getElementById('threadPath');
  const bead = document.getElementById('bead');
  const halo = document.getElementById('beadHalo');

  let len = 0;
  let threadReady = false;

  function buildThread(){

    if(!svg || !path) return;

    if(innerWidth <= 860){
      threadReady = false;
      return;
    }

    const hero = document.getElementById('hero');
    const foot = document.querySelector('.foot');

    if(!hero || !foot) return;

    const docH = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );

    const startY = hero.offsetTop + hero.offsetHeight - 30;
    const endY = foot.offsetTop + 40;

    const cx = innerWidth / 2;

    svg.setAttribute('width', innerWidth);
    svg.setAttribute('height', docH);
    svg.setAttribute('viewBox', `0 0 ${innerWidth} ${docH}`);

    svg.style.height = docH + 'px';

    const span = Math.max(200, endY - startY);
    const amp = Math.min(86, innerWidth * 0.055);

    const waves = Math.max(3, Math.round(span / 540));
    const seg = span / (waves * 2);

    let d = `M ${cx} ${startY}`;
    let dir = 1;

    for(let i=0;i<waves*2;i++){

      const y0 = startY + seg*i;
      const y1 = startY + seg*(i+1);

      const cxp = cx + dir*amp;

      d += ` C ${cxp} ${y0+seg*0.34},
              ${cxp} ${y1-seg*0.34},
              ${cx} ${y1}`;

      dir *= -1;
    }

    path.setAttribute('d', d);

    len = path.getTotalLength();

    path.style.strokeDasharray = len;

    threadReady = true;

    updateThread();
  }

  function updateThread(){

    if(!threadReady) return;

    const max =
      document.documentElement.scrollHeight -
      innerHeight;

    let p = max > 0 ? window.scrollY/max : 0;

    p = Math.max(0, Math.min(1,p));

    if(reduce){
      path.style.strokeDashoffset = 0;
      bead.style.opacity = 0;
      halo.style.opacity = 0;
      return;
    }

    const drawn = len * p;

    path.style.strokeDashoffset = (len - drawn);

    const pt =
      path.getPointAtLength(
        Math.max(0.5, drawn)
      );

    bead.setAttribute('cx', pt.x);
    bead.setAttribute('cy', pt.y);

    halo.setAttribute('cx', pt.x);
    halo.setAttribute('cy', pt.y);

    const vis =
      (p > 0.004 && p < 0.997) ? 1 : 0;

    bead.style.opacity = vis;
    halo.style.opacity = vis ? 0.9 : 0;
  }

  let ticking = false;

  function onScroll(){
    if(!ticking){

      requestAnimationFrame(()=>{
        onScrollNav();
        updateThread();
        ticking = false;
      });

      ticking = true;
    }
  }

  window.addEventListener(
    'scroll',
    onScroll,
    {passive:true}
  );

  buildThread();

  window.addEventListener('load', buildThread);

  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(()=>{
      setTimeout(buildThread,50);
    });
  }

  setTimeout(buildThread,600);

})();