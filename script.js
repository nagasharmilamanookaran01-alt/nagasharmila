/* =========================================================
   Nagasharmila | Portfolio script
   Plain JavaScript, no libraries. Each feature is its own
   small module and is started inside safeInit(), so one
   failure never breaks the rest of the page.

   Features (17):
    1  Mobile menu            10  Highlight details popup (dialog)
    2  Smooth scroll + focus  11  Contact form validation
    3  Active link (scrollspy)12  Live character counter
    4  Scroll progress bar    13  Copy email + toast
    5  Sticky header style    14  Animated network background
    6  Theme toggle (saved)   15  Back-to-top button
    7  Typing effect          16  Live local clock
    8  Reveal on scroll       17  Keyboard shortcuts (1-4)
    9  Animated counters      +   Highlight filter, card tilt
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // localStorage can throw (private mode), so wrap it.
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* ignore */ } }
  };

  const throttle = (fn) => {
    let ticking = false;
    return (...args) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { fn(...args); ticking = false; });
    };
  };

  /* ---------- Data ---------- */
  const EMAIL = 'nagasharmilamanookaran01@gmail.com';

  const DETAILS = {
    edu: {
      title: 'Education',
      tag: 'Where I study',
      items: [
        '<strong>BSc Computer Science (Networking)</strong>, UNIMAS, 2024 to present',
        '<strong>Diploma in Digital Technology (Networking)</strong>, Politeknik Ungku Omar, 2019 to 2022',
        '<strong>SPM</strong>, SMK Convent Teluk Intan'
      ]
    },
    exp: {
      title: 'Experience',
      tag: 'KMS Autocount · Jan 2022 to Jan 2023',
      items: [
        '<strong>Role:</strong> POS System Technician and Customer Support Executive',
        'Fixed POS, printer and PC issues by phone, email and on-site',
        'Checked LAN/WAN connections and helped set up routers and switches',
        'Trained customers and internship students'
      ]
    },
    skills: {
      title: 'Technical Skills',
      tag: 'What I can do',
      items: [
        '<strong>Networking:</strong> LAN/WAN troubleshooting, Cisco Packet Tracer',
        '<strong>IT Support:</strong> hardware and software troubleshooting, helpdesk',
        '<strong>Security:</strong> firewall and VPN basics, backup checks',
        '<strong>Systems:</strong> operating systems, cloud basics (AWS/Azure)',
        '<strong>Programming:</strong> Java (OOP, Swing)'
      ]
    },
    ach: {
      title: 'Achievements',
      tag: 'Recognition',
      items: [
        '<strong>Best AI Proposal</strong>, ICT-Edu Tourism International Competition',
        'Recognised for fast, effective technical support during industry attachment',
        'Mentored internship students in basic IT support'
      ]
    },
    lang: {
      title: 'Languages',
      tag: 'How I communicate',
      items: [
        '<strong>Tamil</strong>, native',
        '<strong>English</strong>, proficient',
        '<strong>Bahasa Malaysia</strong>, proficient'
      ]
    }
  };

  /* ---------- 1. Mobile menu ---------- */
  function initMenu() {
    const btn = $('#menuBtn');
    const list = $('#navLinks');
    if (!btn || !list) return;

    const setOpen = (open) => {
      list.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    btn.addEventListener('click', () => setOpen(!list.classList.contains('open')));
    $$('a', list).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && list.classList.contains('open')) { setOpen(false); btn.focus(); }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 860) setOpen(false); });
  }

  /* ---------- 2. Smooth scroll + move focus to the section ---------- */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        const target = id.length > 1 ? $(id) : null;
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        history.replaceState(null, '', id);
      });
    });
  }

  /* ---------- 3. Active link (scrollspy) ---------- */
  function initScrollSpy() {
    const links = $$('.nav-links a');
    const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    if (!('IntersectionObserver' in window) || !sections.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => {
          const on = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((s) => io.observe(s));
  }

  /* ---------- 4, 5, 15. Scroll progress, sticky header, back-to-top ---------- */
  function initScrollUI() {
    const bar = $('#progress');
    const header = $('#header');
    const top = $('#toTop');

    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      if (header) header.classList.toggle('scrolled', y > 20);
      if (top) top.classList.toggle('show', y > 600);
    };

    window.addEventListener('scroll', throttle(update), { passive: true });
    window.addEventListener('resize', throttle(update));
    update();

    if (top) top.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- 6. Theme toggle (remembered) ---------- */
  function initTheme() {
    const btn = $('#themeToggle');
    const root = document.documentElement;
    const meta = $('meta[name="theme-color"]');
    if (!btn) return;

    const apply = (theme) => {
      root.setAttribute('data-theme', theme);
      const light = theme === 'light';
      btn.setAttribute('aria-pressed', String(light));
      btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
      if (meta) meta.setAttribute('content', light ? '#f6f8fc' : '#0b1020');
    };

    const saved = store.get('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    apply(saved || (prefersLight ? 'light' : 'dark'));

    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      apply(next);
      store.set('theme', next);
      document.dispatchEvent(new Event('themechange'));
    });
  }

  /* ---------- 7. Typing effect ---------- */
  function initTyping() {
    const el = $('#typed');
    if (!el) return;
    const words = [
      'Computer Science (Networking) Student',
      'IT Support Enthusiast',
      'Seeking a 6-month Internship'
    ];

    if (reduceMotion) { el.textContent = words[0]; return; }

    let w = 0, i = 0, deleting = false;
    const tick = () => {
      const word = words[w];
      i += deleting ? -1 : 1;
      el.textContent = word.slice(0, i);

      let delay = deleting ? 35 : 70;
      if (!deleting && i === word.length) { deleting = true; delay = 1600; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
      setTimeout(tick, delay);
    };
    tick();
  }

  /* ---------- 8. Reveal on scroll ---------- */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    items.forEach((el, idx) => {
      el.style.transitionDelay = (idx % 5) * 70 + 'ms';
      io.observe(el);
    });
  }

  /* ---------- 9. Animated counters ---------- */
  function initCounters() {
    const nums = $$('[data-count]');
    if (!nums.length) return;

    const run = (el) => {
      const end = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      if (reduceMotion || !Number.isFinite(end)) { el.textContent = end + suffix; return; }
      const start = performance.now();
      const dur = 1400;
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach((n) => io.observe(n));
  }

  /* ---------- Highlight filter ---------- */
  function initFilter() {
    const chips = $$('.chip');
    const cards = $$('#highlightGrid .card');
    const status = $('#filterStatus');
    if (!chips.length) return;

    chips.forEach((chip) => chip.addEventListener('click', () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      let shown = 0;
      cards.forEach((card) => {
        const match = f === 'all' || card.dataset.cat.split(' ').includes(f);
        card.classList.toggle('hide', !match);
        if (match) shown++;
      });
      if (status) status.textContent = 'Showing ' + shown + ' of ' + cards.length + ' highlights';
    }));
  }

  /* ---------- 10. Highlight details popup ---------- */
  function initModal() {
    const dlg = $('#modal');
    if (!dlg) return;
    const title = $('#modalTitle');
    const body = $('#modalBody');
    let opener = null;

    // Fallback for browsers without <dialog>
    if (typeof dlg.showModal !== 'function') {
      $$('[data-open]').forEach((b) => b.hidden = true);
      return;
    }

    const open = (key, trigger) => {
      const d = DETAILS[key];
      if (!d) return;
      opener = trigger;
      title.textContent = d.title;
      body.innerHTML = '<p class="tag">' + d.tag + '</p><ul>' +
        d.items.map((t) => '<li>' + t + '</li>').join('') + '</ul>';
      dlg.showModal();
    };

    $$('[data-open]').forEach((b) => b.addEventListener('click', () => open(b.dataset.open, b)));
    $('#modalClose').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // click backdrop
    dlg.addEventListener('close', () => { if (opener) opener.focus(); });
  }

  /* ---------- Card tilt ---------- */
  function initTilt() {
    if (reduceMotion || !window.matchMedia('(hover: hover)').matches) return;
    $$('.tilt').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(700px) rotateX(' + (-y * 6) + 'deg) rotateY(' + (x * 6) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- 11 + 12. Contact form: validation and character counter ---------- */
  function initForm() {
    const form = $('#contactForm');
    if (!form) return;
    const note = $('#formNote');
    const count = $('#count');
    const msg = $('#message');

    const rules = {
      name: (v) => v.trim().length >= 2 ? '' : 'Please enter your name.',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email.',
      message: (v) => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters.'
    };

    const check = (input) => {
      const err = rules[input.name](input.value);
      const wrap = input.closest('.field');
      $('#' + input.id + '-err').textContent = err;
      wrap.classList.toggle('invalid', Boolean(err));
      wrap.classList.toggle('valid', !err);
      input.setAttribute('aria-invalid', String(Boolean(err)));
      return !err;
    };

    const fields = $$('input, textarea', form);
    fields.forEach((f) => {
      f.addEventListener('blur', () => check(f));
      f.addEventListener('input', () => { if (f.closest('.field').classList.contains('invalid')) check(f); });
    });

    // 12. Live character counter
    if (msg && count) msg.addEventListener('input', () => {
      count.textContent = msg.value.length + ' / ' + msg.maxLength;
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const results = fields.map(check);
      const firstBad = fields[results.indexOf(false)];
      if (firstBad) { firstBad.focus(); note.textContent = ''; return; }

      // Front-end only: open the visitor's email app with the message filled in.
      const data = new FormData(form);
      const subject = encodeURIComponent('Portfolio message from ' + data.get('name'));
      const bodyText = encodeURIComponent(data.get('message') + '\n\nFrom: ' + data.get('name') + ' (' + data.get('email') + ')');
      window.location.href = 'mailto:' + EMAIL + '?subject=' + subject + '&body=' + bodyText;

      note.textContent = 'Thanks! Your email app should open now.';
      form.reset();
      count.textContent = '0 / ' + msg.maxLength;
      $$('.field', form).forEach((f) => f.classList.remove('valid', 'invalid'));
    });
  }

  /* ---------- 13. Copy email + toast ---------- */
  function initCopy() {
    const btn = $('#copyEmail');
    const toast = $('#toast');
    if (!btn) return;
    let timer;

    const show = (text) => {
      if (!toast) return;
      toast.textContent = text;
      toast.classList.add('show');
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove('show'), 2200);
    };

    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(EMAIL);
        show('Email copied to clipboard');
      } catch (err) {
        // Fallback for older browsers / non-secure pages
        const t = document.createElement('textarea');
        t.value = EMAIL; t.setAttribute('readonly', '');
        t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
        t.remove();
        show(ok ? 'Email copied to clipboard' : 'Press Ctrl+C to copy the email');
      }
    });
  }

  /* ---------- 14. Animated network background (canvas) ---------- */
  function initNetwork() {
    const canvas = $('#netCanvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, nodes = [], raf = 0, visible = true;
    const mouse = { x: -999, y: -999 };

    const color = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#5eead4';
    let accent = color();
    document.addEventListener('themechange', () => { accent = color(); });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(24, Math.min(70, Math.floor(w * h / 18000)));
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = accent; ctx.strokeStyle = accent;
      const maxD = 140;

      for (let a = 0; a < nodes.length; a++) {
        const p = nodes[a];
        if (!reduceMotion) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
        ctx.globalAlpha = .8;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();

        for (let b = a + 1; b < nodes.length; b++) {
          const q = nodes[b];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < maxD) {
            ctx.globalAlpha = (1 - d / maxD) * .35;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        // Link nodes to the pointer
        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dm < 170) {
          ctx.globalAlpha = (1 - dm / 170) * .6;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      if (!reduceMotion && visible) raf = requestAnimationFrame(draw);
    };

    resize(); draw();
    window.addEventListener('resize', throttle(() => { resize(); if (reduceMotion) draw(); }));

    const hero = canvas.parentElement;
    hero.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });

    // Pause the animation when the hero is off-screen (saves battery)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible && !reduceMotion) draw();
      }).observe(hero);
    }
  }

  /* ---------- 16. Live local clock (Malaysia) ---------- */
  function initClock() {
    const el = $('#clock');
    if (!el) return;
    let fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      });
    } catch (e) { el.textContent = 'Malaysia (GMT+8)'; return; }
    const tick = () => { el.textContent = fmt.format(new Date()) + ' MYT'; };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 17. Keyboard shortcuts (1 to 4) ---------- */
  function initShortcuts() {
    const map = {};
    $$('.nav-links a[data-key]').forEach((a) => { map[a.dataset.key] = a; });

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;   // don't hijack typing
      if (document.querySelector('dialog[open]')) return;
      if (map[e.key]) map[e.key].click();
    });
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- Start everything safely ---------- */
  function safeInit(fn) {
    try { fn(); } catch (err) { console.warn('Feature failed to start:', fn.name, err); }
  }

  document.addEventListener('DOMContentLoaded', () => {
    [
      initTheme, initMenu, initSmoothScroll, initScrollSpy, initScrollUI,
      initTyping, initReveal, initCounters, initFilter, initModal, initTilt,
      initForm, initCopy, initNetwork, initClock, initShortcuts, initYear
    ].forEach(safeInit);
  });
})();
