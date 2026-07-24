/* ===== NTT Private Events — Something Permanent · cinematic scroll site ===== */
(() => {
'use strict';
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const params = new URLSearchParams(location.search);
const STILL = params.has('still');
if (STILL) document.body.classList.add('still');

/* ---------- The Packages (pricing locked 2026-07-14) ---------- */
const TIERS = [
  {
    name: 'The Party Block',
    spec: '2 hours on site · Up to 6 tattoos',
    desc: 'Bridal showers, engagement parties, and intimate bachelorettes.',
    label: 'Flat', price: '$1,000',
    img: 'assets/events/tier-party.jpg?v=2',
    alt: 'Fine line florals tattooed at the reception table beside champagne and roses',
    stamp: null
  },
  {
    name: 'The Main Event',
    spec: '4 hours on site · Up to 12 tattoos',
    desc: 'The bachelorette standard. Room for the whole group without rushing a single piece.',
    label: 'Flat', price: '$1,800',
    img: 'assets/events/tier-main.jpg?v=2',
    alt: 'Bachelorette party getting tiny fine line tattoos in a living room',
    stamp: 'feat'
  },
  {
    name: 'The Wedding & All Day',
    spec: '4 hours on site · Date reserved & planned around',
    desc: 'The full experience: planning call, venue coordination, a flash menu themed to your wedding, and any one $500 add-on included free. Groups larger than 12 book here.',
    label: 'From', price: '$3,500',
    img: 'assets/events/tier-wedding.jpg',
    alt: 'Bride and groom comparing matching fine line tattoos at the after party',
    stamp: null
  },
];

/* ---------- Reviews (verbatim from Google — Nick Tyler Tattoo, Selden NY · ★5.0) ---------- */
const REVIEWS = [
  ['Jamie B.', "10/10 experience with Nick today. Loved how smooth and easy the process was. He made me feel really comfortable and the place was super clean. Line work is amazing!"],
  ['Cristian S.', "It's clear that Nick takes pride in his work and genuinely cares about giving his clients a great experience. Already booking for the next piece!"],
  ['Gabrielle N.', "Nick did my first tattoo and it came out exactly how I imagined it. The whole process felt seamless and easy… I'm beyond happy with it and will definitely be going back."],
  ['Edward A.', "Nicholas made me feel welcomed and comfortable. Did not rush the tattoo, and very attentive to details. I highly recommend Nick Tyler Tattoo."],
  ['Remmy B.', "Super responsive with all questions and very helpful. Works quickly while still having amazing end results! Genuinely such a great experience!"],
];

/* ---------- FAQ (Private Events facts, locked with the 7/14 pricing) ---------- */
const FAQ = [
  ['What exactly is a private tattoo event?', "A private fine line flash session at your wedding venue, shower, bachelorette, or the after party. I bring the full studio to you. Your guests pick small pieces from a flash menu drawn for the occasion, spend 15 to 25 minutes in the chair, and get back to the party."],
  ['What does it cost?', "The Party Block is a flat $1,000 for 2 hours on site with up to 6 tattoos. The Main Event is a flat $1,800 for 4 hours and up to 12. The Wedding & All Day tier starts at $3,500 with a planning call, venue coordination, a flash menu themed to your wedding, and any one $500 add-on included free. It is never priced per guest, and your guests never open their wallets."],
  ['How does booking work?', "DM me on Instagram with your date, your venue and town, and your party size. If the date is open, a retainer locks it and everything is confirmed in writing."],
  ['How many tattoos can our group get?', "Up to 3 pieces per hour, and that cap is firm. It is the pace that keeps every piece clean, and it is why these tattoos look like studio work instead of party favors. Groups larger than 12 book the Wedding & All Day tier so nobody gets rushed."],
  ['What do guests pick from?', "A flash menu of 12 to 24 designs drawn for the occasion: Bridal Botanicals, Ornamental, Ceremony pieces, and Matching Sets for the whole group. Every piece is 1 to 3 inches, fine line, single needle."],
  ['Can we get custom pieces?', "Yes, through the Wedding & All Day add-ons: bride & groom custom pieces drawn just for you two, a custom wedding flash sheet designed around your story and your date, or an extra hour on site. Each is $500, and any one of them comes free with the tier. A weekend extension (a 2 hour rehearsal dinner mini session) is $900, permit pending based on venue."],
  ['Is it safe outside a studio?', "Yes. Full mobile studio, single-use everything, sealed and opened in front of you. I am a licensed, insured studio artist, and every guest leaves with real aftercare so it heals as clean as it went on."],
  ['Who can get tattooed?', "Guests 18 and up, ID checked, with signed consent while sober. All of it is handled before the bar opens."],
  ['Where do you travel?', "Long Island, the Hamptons, and New York City. Suffolk County events need the date locked at least 3 weeks out for county permits, so the earlier you reach out, the better."],
  ['What dates are open?', "Remaining fall and winter 2026 dates are limited, and the 2027 season is booking now. Send your date and I will tell you straight away."],
];

/* ================================================================
   Smooth scroll — Lenis + GSAP ScrollTrigger
   ================================================================ */
let lenis = null;
gsap.registerPlugin(ScrollTrigger);
if (!STILL) {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1.0 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ================================================================
   Hero — orbit frame sequence, scroll-scrubbed on canvas
   ================================================================ */
const orbit = (() => {
  const canvas = $('#orbitCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const state = { frames: [], count: 0, loaded: 0, cur: -1, want: 0, poster: null, ready: false };

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width  = Math.round(canvas.clientWidth  * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    draw(state.cur < 0 ? 0 : state.cur, true);
  }

  /* cover-fit draw of frame i (or nearest loaded one walking backwards) */
  function draw(i, force) {
    let img = null, pick = -1;
    if (state.count) {
      for (let k = i; k >= 0; k--) {
        const f = state.frames[k];
        if (f && f.complete && f.naturalWidth) { img = f; pick = k; break; }
      }
    }
    if (!img && state.poster && state.poster.complete && state.poster.naturalWidth) { img = state.poster; pick = -2; }
    if (!img || (pick === state.cur && !force)) return;
    state.cur = pick === -2 ? -1 : pick;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const s = Math.max(cw / iw, ch / ih);
    const dw = iw * s, dh = ih * s;
    ctx.fillStyle = '#0A0A0B';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  function progress(p) {
    if (!state.count) { draw(0); return; }
    const i = Math.max(0, Math.min(state.count - 1, Math.round(p * (state.count - 1))));
    state.want = i;
    draw(i);
  }

  /* poster fallback immediately */
  state.poster = new Image();
  state.poster.onload = () => draw(0, true);
  state.poster.src = 'assets/hero-poster.jpg';

  /* frame sequence via manifest (written by the frame-extraction step) */
  fetch('assets/seq/orbit/manifest.json')
    .then(r => r.ok ? r.json() : null)
    .then(m => {
      if (!m || !m.count) return;
      state.count = m.count;
      const pad = n => String(n).padStart(3, '0');
      const order = [];
      const stride = 6;                       // sparse first pass, then fill
      for (let i = 0; i < m.count; i += stride) order.push(i);
      for (let i = 0; i < m.count; i++) if (i % stride) order.push(i);
      let inflight = 0, qi = 0;
      const pump = () => {
        while (inflight < 8 && qi < order.length) {
          const idx = order[qi++]; inflight++;
          const img = new Image();
          /* decode ahead of drawImage so scrubbing never hits a synchronous JPEG
             decode; repaint the parked canvas as better frames arrive */
          const done = () => {
            inflight--; state.loaded++;
            draw(state.want, idx === 0);
            loaderTick();
            pump();
          };
          img.src = `assets/seq/orbit/f-${pad(idx + 1)}.jpg`;
          if (img.decode) img.decode().then(done, done);
          else img.onload = img.onerror = done;
          state.frames[idx] = img;
        }
        if (state.loaded >= Math.min(m.count, 24) && !state.ready) { state.ready = true; }
      };
      pump();
    })
    .catch(() => {});

  addEventListener('resize', resize);
  resize();
  return { progress, state, resize };
})();

/* ---------- preloader — waits for poster + first frames, then reveals ---------- */
function loaderTick() {
  const bar = $('#loaderBar');
  if (!bar) return;
  const target = Math.min(1, orbit.state.count ? orbit.state.loaded / Math.min(orbit.state.count, 40) : 1);
  bar.style.width = Math.round(target * 100) + '%';
  if (target >= 1) hideLoader();
}
let loaderHidden = false;
function hideLoader() {
  if (loaderHidden) return;
  loaderHidden = true;
  $('#loader').classList.add('done');
}
/* never hold the page hostage */
setTimeout(hideLoader, STILL ? 400 : 3500);
addEventListener('load', () => setTimeout(hideLoader, 1200));

/* ---------- hero scroll timeline ---------- */
(() => {
  const hero = $('#hero');

  if (STILL) {
    /* frozen state for screenshots: ?still = title at frame 0, ?still&stage=2 = mid-scrub stage 2 */
    if (params.get('stage') === '2') {
      $('#heroT1').style.opacity = 0;
      $('#heroT2').style.opacity = 1;
      orbit.progress(0.65);
    } else {
      $$('#heroT1 .hero__line').forEach(el => { el.style.letterSpacing = '-0.01em'; el.style.opacity = 1; });
      $('#heroT1').style.opacity = 1;
      orbit.progress(0);
    }
    return;
  }

  /* canvas scrub across the whole 340vh track PLUS the exit — 'bottom top'
     keeps the orbit turning while the unpinned hero rides up out of frame */
  ScrollTrigger.create({
    trigger: hero, start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: st => orbit.progress(st.progress)
  });

  const tl = gsap.timeline({
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: true },
    defaults: { ease: 'none' }
  });

  /* Stage 1 — NICK TYLER TATTOO tracks in over the orbit, then drifts away */
  const lines = $$('#heroT1 .hero__line');
  gsap.set(lines, { letterSpacing: '0.55em', opacity: 0 });
  gsap.set($$('#heroT1 .kicker'), { opacity: 0, y: 10 });
  tl.to(lines, { letterSpacing: '-0.01em', opacity: 1, duration: .14, stagger: .02 }, 0.015)
    .to('#heroT1 .kicker', { opacity: 1, y: 0, duration: .06, stagger: .04 }, 0.05)
    .to('#heroT1', { opacity: 0, y: -60, duration: .09 }, 0.38)
  /* Stage 2 — discipline lines ride out the rotation */
    .fromTo('#heroT2', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .09 }, 0.52)
    .to('#heroT2', { opacity: 0, y: -50, duration: .08 }, 0.80)
  /* scroll cue dies immediately */
    .to('#heroCue', { opacity: 0, duration: .03 }, 0.02);
})();

/* ================================================================
   Marquee — duplicate content for a seamless -50% loop
   ================================================================ */
(() => {
  const inner = $('#marqueeInner');
  inner.appendChild(inner.firstElementChild.cloneNode(true));
})();

/* ================================================================
   Nav — background after leaving hero top
   ================================================================ */
(() => {
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > innerHeight * .6);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ================================================================
   Reviews
   ================================================================ */
(() => {
  $('#proofBadge').innerHTML = `★★★★★&ensp;5.0 on Google · 100+ reviews · Selden, NY`;
  $('#proofList').innerHTML = REVIEWS.map(([by, text]) => `
    <figure class="quote" data-reveal>
      <blockquote class="quote__text">${text}</blockquote>
      <figcaption class="quote__by"><b>${by}</b> — Google review</figcaption>
    </figure>`).join('');
})();

/* ================================================================
   Film sections — sticky video + scroll-timed text
   ================================================================ */
(() => {
  $$('.film').forEach(sec => {
    const video = $('.film__video', sec);
    const a = $('.film__text--a', sec), b = $('.film__text--b', sec);

    if (!STILL) {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true },
        defaults: { ease: 'none' }
      });
      tl.fromTo(a, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .12 }, 0.10)
        .to(a, { opacity: 0, y: -30, duration: .10 }, 0.38)
        .fromTo(b, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .12 }, 0.55)
        .to(b, { opacity: 0, y: -30, duration: .10 }, 0.86);
    } else {
      a.style.opacity = 1;
    }

    /* play only while on screen; assembly plays once and holds its final frame */
    if (STILL) { video.preload = 'none'; return; }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        /* non-looping films (assembly) hold their final frame instead of replaying */
        if (!video.loop && video.ended) return;
        video.play().catch(() => {});
      }
      else video.pause();
    }), { threshold: 0.1 });
    io.observe(video);
  });

  /* finale ambient video */
  const fv = $('#finaleVideo');
  if (!STILL) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) fv.play().catch(() => {}); else fv.pause();
    }), { threshold: 0.1 });
    io.observe(fv);
  }
})();

/* ================================================================
   The Packages — three tiers on the plate grid
   ================================================================ */
(() => {
  const grid = $('#dropGrid');
  $('#dropCount').textContent = 'Not priced per guest · whether the party is 8 or the wedding is 200';

  grid.innerHTML = TIERS.map((t, i) => `
    <article class="plate">
      <div class="plate__imgwrap">
        <img src="${t.img}" alt="${t.alt}" loading="lazy">
        <span class="plate__no">No. 0${i + 1}</span>
        ${t.stamp === 'feat' ? '<span class="stamp stamp--feat">Most booked</span>' : ''}
      </div>
      <div class="plate__meta">
        <p class="plate__title">${t.name}</p>
        <p class="plate__spec">${t.spec}</p>
        <p class="plate__desc">${t.desc}</p>
        <div class="plate__row">
          <span class="plate__price">${t.label} ${t.price}</span>
          <a class="plate__claim" href="#custom" data-cursor="link">Check your date</a>
        </div>
      </div>
    </article>`).join('');
  /* grid height changed — re-measure every trigger below the packages, or
     reveals/scrubs further down keep stale pixel positions and never fire */
  if (!STILL && window.ScrollTrigger) ScrollTrigger.refresh();
})();

/* ================================================================
   FAQ accordion
   ================================================================ */
(() => {
  $('#faqList').innerHTML = FAQ.map(([q, a]) => `
    <div class="faq-item">
      <button class="faq-q" data-cursor="link"><span>${q}</span><span class="faq-ic" aria-hidden="true">+</span></button>
      <div class="faq-a"><p>${a}</p></div>
    </div>`).join('');
  $('#faqList').addEventListener('click', e => {
    const q = e.target.closest('.faq-q'); if (!q) return;
    const item = q.parentElement, a = $('.faq-a', item);
    const open = item.classList.toggle('open');
    if (open) {
      a.style.maxHeight = a.scrollHeight + 'px';
    } else {
      /* if the open item settled at 'none', restore a pixel value so the
         close transition has something to animate from */
      if (a.style.maxHeight === 'none') { a.style.maxHeight = a.scrollHeight + 'px'; void a.offsetHeight; }
      a.style.maxHeight = '0px';
    }
  });
  /* after the transition: release the height clamp so open answers reflow on
     resize, and re-measure scroll positions since the page height changed */
  $('#faqList').addEventListener('transitionend', e => {
    const a = e.target;
    if (!a.classList || !a.classList.contains('faq-a')) return;
    if (a.parentElement.classList.contains('open')) a.style.maxHeight = 'none';
    if (!STILL && window.ScrollTrigger) ScrollTrigger.refresh();
  });
})();

/* ================================================================
   Generic reveals
   ================================================================ */
(() => {
  if (STILL) return;
  $$('[data-reveal]').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%' }
    });
  });
})();

/* ================================================================
   Cursor dot
   ================================================================ */
(() => {
  if (STILL || matchMedia('(hover: none)').matches) return;
  const c = $('#cursor');
  let shown = false;
  addEventListener('mousemove', e => {
    if (!shown) { c.classList.add('on'); shown = true; }
    c.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
    c.classList.toggle('big', !!e.target.closest('[data-cursor="link"],a,button'));
  }, { passive: true });
})();

/* ---------- smooth anchor jumps through Lenis ---------- */
/* debug hook for automated verification */
window.__NT = { orbit, STILL, lenis: () => lenis };

$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = $(id); if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { offset: 0, duration: 1.6 });
    else t.scrollIntoView();
  });
});

})();
