/* ─────────────────────────────
   app.js  —  SKY SIGMA SITE
───────────────────────────────*/

/* ══════════ LANYARD DISCORD LIVE ══════════ */
(function initLanyard() {
  const DISCORD_ID = '1413479830221094933';
  const API_URL = 'https://api.lanyard.rest/v1/users/' + DISCORD_ID;

  // DOM references
  const avatarEl  = document.querySelector('.dc-avatar');
  const nameEl    = document.querySelector('.dc-name');
  const tagEl     = document.querySelector('.dc-tag');
  const statusDot = document.querySelector('.dc-status-dot');
  const aboutEl   = document.querySelector('.dc-section p');
  const statusMsg = document.querySelector('.dc-status-msg');

  // Status colors
  const STATUS_COLORS = {
    online:  '#22c55e',
    idle:    '#f59e0b',
    dnd:     '#ef4444',
    offline: '#6b6b6b',
  };

  function updateProfile(data) {
    if (!data || !data.discord_user) return;

    const user = data.discord_user;

    // Update avatar
    if (user.avatar && avatarEl) {
      const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
      avatarEl.src = 'https://cdn.discordapp.com/avatars/' + user.id + '/' + user.avatar + '.' + ext + '?size=256';
    }

    // Update display name
    if (nameEl) {
      const displayName = user.global_name || user.display_name || user.username || 'AARAV';
      // Keep the red styling for Aarav/Sigma
      if (displayName.toUpperCase() === 'AARAV' || displayName.toUpperCase() === 'ONLYYYAARAV') {
        nameEl.innerHTML = 'AA<span class="red">R</span>AV';
      } else {
        nameEl.textContent = displayName;
      }
    }

    // Update username tag
    if (tagEl) {
      tagEl.textContent = user.username || 'onlyyyaarav';
    }

    // Update online status dot
    if (statusDot) {
      const status = data.discord_status || 'offline';
      statusDot.style.background = STATUS_COLORS[status] || STATUS_COLORS.offline;
      // Adjust animation for offline
      statusDot.style.animationPlayState = status === 'offline' ? 'paused' : 'running';
    }

    // Update custom status
    if (data.activities && data.activities.length > 0) {
      const customStatus = data.activities.find(a => a.type === 4);
      if (customStatus && statusMsg) {
        statusMsg.textContent = (customStatus.emoji ? customStatus.emoji.name + ' ' : '') + (customStatus.state || '');
      }

      // Show what they're playing/doing
      const activity = data.activities.find(a => a.type !== 4);
      if (activity && aboutEl) {
        const actLabels = ['Playing', 'Streaming', 'Listening to', 'Watching', '', 'Competing in'];
        const label = actLabels[activity.type] || '';
        aboutEl.textContent = label + ' ' + activity.name;
      }
    }

    // Update Spotify status
    const spotifyWrap = document.getElementById('dc-spotify');
    if (spotifyWrap) {
      if (data.listening_to_spotify && data.spotify) {
        spotifyWrap.style.display = 'block';
        const spotifyArt = document.getElementById('spotify-art');
        const spotifySong = document.getElementById('spotify-song');
        const spotifyArtist = document.getElementById('spotify-artist');
        const spotifyProgress = document.getElementById('spotify-progress');
        
        if (spotifyArt) spotifyArt.src = data.spotify.album_art_url || '';
        if (spotifySong) spotifySong.textContent = data.spotify.song || '';
        if (spotifyArtist) spotifyArtist.textContent = data.spotify.artist || '';
        
        if (spotifyProgress && data.spotify.timestamps) {
          const start = data.spotify.timestamps.start;
          const end = data.spotify.timestamps.end;
          
          if (window.spotifyInterval) clearInterval(window.spotifyInterval);
          
          const updateProgress = () => {
            const now = Date.now();
            const total = end - start;
            const current = now - start;
            let percent = (current / total) * 100;
            percent = Math.max(0, Math.min(100, percent));
            spotifyProgress.style.width = percent + '%';
          };
          updateProgress();
          window.spotifyInterval = setInterval(updateProgress, 1000);
        }
      } else {
        spotifyWrap.style.display = 'none';
        if (window.spotifyInterval) {
          clearInterval(window.spotifyInterval);
          window.spotifyInterval = null;
        }
      }
    }

    // Update banner color if available
    // Banner color syncing disabled to show static banner image
  }

  // Initial fetch via REST
  function fetchProfile() {
    fetch(API_URL)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) updateProfile(res.data);
      })
      .catch(() => console.log('[Lanyard] REST fetch failed, using defaults'));
  }

  // WebSocket for real-time updates
  function connectWebSocket() {
    try {
      const ws = new WebSocket('wss://api.lanyard.rest/socket');
      let heartbeat;

      ws.onopen = () => console.log('[Lanyard] Connected');

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        switch (msg.op) {
          case 1: // Hello — send init + start heartbeat
            ws.send(JSON.stringify({
              op: 2,
              d: { subscribe_to_id: DISCORD_ID }
            }));
            heartbeat = setInterval(() => {
              ws.send(JSON.stringify({ op: 3 }));
            }, msg.d.heartbeat_interval);
            break;

          case 0: // Event (INIT_STATE or PRESENCE_UPDATE)
            if (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE') {
              updateProfile(msg.d);
            }
            break;
        }
      };

      ws.onclose = () => {
        clearInterval(heartbeat);
        console.log('[Lanyard] Disconnected, reconnecting in 5s...');
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = () => ws.close();
    } catch (e) {
      console.log('[Lanyard] WebSocket not available, using REST fallback');
      // Fallback: poll every 30s
      setInterval(fetchProfile, 30000);
    }
  }

  // Start
  fetchProfile();
  connectWebSocket();
})();

/* ══════════ MATRIX RAIN ══════════ */
(function() {
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, drops = [];
  const chars = 'ΣΣΣAARAVΣ01ABCDEF0101ΣΣNO EXCUSES GRIND SIGMA LONE WOLF 01';

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    drops = [];
    const cols = Math.floor(W / 16);
    for (let i = 0; i < cols; i++) drops[i] = Math.random() * -H;
  }
  window.addEventListener('resize', resize);
  resize();

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = '13px JetBrains Mono, monospace';
    
    for (let i = 0; i < drops.length; i++) {
      const c = chars[Math.floor(Math.random() * chars.length)];
      
      // Draw trailing character in red (overwriting previous head)
      ctx.fillStyle = '#dc2626';
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 16, drops[i] - 16);
      
      // Draw the head character in bright white
      ctx.fillStyle = '#ffffff';
      ctx.fillText(c, i * 16, drops[i]);
      
      if (drops[i] > H && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 16;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════ TYPEWRITER (role) ══════════ */
(function() {
  const el = document.getElementById('role-type');
  const words = [
    'C++ DEVELOPER',
    'JAVA DEVELOPER',
    'C# DEVELOPER',
    'ANDROID MODDER',
    'PC X JADUGAR OWNER',
  ];
  let wi = 0, ci = 0, del = false;

  function tick() {
    const w = words[wi];
    if (!del) {
      el.textContent = w.slice(0, ci + 1);
      ci++;
      if (ci === w.length) { del = true; setTimeout(tick, 2000); return; }
    } else {
      el.textContent = w.slice(0, ci - 1);
      ci--;
      if (ci === 0) { del = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(tick, del ? 45 : 80);
  }
  tick();
})();

/* ══════════ NAV ══════════ */
(function() {
  const nav = document.getElementById('nav');
  const links = document.querySelectorAll('.nl');
  const sections = document.querySelectorAll('section[id]');
  const st = document.getElementById('scroll-top-btn');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    st.classList.toggle('visible', y > 300);
    let cur = '';
    sections.forEach(s => { if (s.offsetTop - 130 <= y) cur = s.id; });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
  });

  st.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ══════════ REVEAL ══════════ */
(function() {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
})();

/* ══════════ COUNTERS ══════════ */
(function() {
  const nums = document.querySelectorAll('.sb-num');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.target;
      let cur = 0; const step = Math.ceil(target / 40);
      const t = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur;
        if (cur >= target) clearInterval(t);
      }, 28);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
})();

/* ══════════ SKILL BARS ══════════ */
(function() {
  const fills = document.querySelectorAll('.ars-fill');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.style.width = e.target.dataset.w + '%';
      io.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  fills.forEach(f => io.observe(f));
})();

/* ══════════ CONTACT FORM ══════════ */
(function() {
  document.getElementById('contact-form').addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('send-btn');
    btn.textContent = 'SENDING…';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '✓ SENT SUCCESSFULLY';
      document.getElementById('contact-form').reset();
      setTimeout(() => { btn.textContent = 'SEND MESSAGE ▶'; btn.disabled = false; }, 3000);
    }, 1400);
  });
})();

/* ══════════ MUSIC PLAYER ══════════ */
(function() {
  const audio    = document.getElementById('audio');
  const playBtn  = document.getElementById('play-btn');
  const prevBtn  = document.getElementById('prev-btn');
  const nextBtn  = document.getElementById('next-btn');
  const muteBtn  = document.getElementById('mute-btn');
  const eqBars   = document.getElementById('eq-bars');
  const titleEl  = document.getElementById('mb-title');
  const artistEl = document.getElementById('mb-artist');
  const prog     = document.getElementById('mb-progress');

  const tracks = [
    { title: 'I Guess', artist: 'KR$NA', src: 'IGuess.mp3' },
    { title: 'AURA',  artist: 'AARAV — onlyyyaarav',  src: 'Aura.mp3' },
  ];

  let idx = 0, playing = false;

  function load(i) {
    const t = tracks[i];
    titleEl.textContent  = t.title;
    artistEl.textContent = t.artist;
    audio.src = t.src;
    audio.volume = 0.5;
    if (playing) audio.play();
  }

  function setPlayState(state) {
    playing = state;
    playBtn.textContent = playing ? '⏸' : '▶';
    eqBars.classList.toggle('paused', !playing);
  }

  function toggle() {
    if (playing) {
      audio.pause(); setPlayState(false);
    } else {
      audio.play().then(() => setPlayState(true)).catch(() => {});
    }
  }

  playBtn.addEventListener('click', toggle);
  prevBtn.addEventListener('click', () => { idx = (idx - 1 + tracks.length) % tracks.length; load(idx); });
  nextBtn.addEventListener('click', () => { idx = (idx + 1) % tracks.length; load(idx); });
  muteBtn.addEventListener('click', () => { audio.muted = !audio.muted; muteBtn.textContent = audio.muted ? '🔇' : '🔊'; });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) prog.style.width = (audio.currentTime / audio.duration * 100) + '%';
  });
  audio.addEventListener('ended', () => { idx = (idx + 1) % tracks.length; load(idx); if (!playing) toggle(); });

  load(0);

  // Auto-play on first interaction
  let started = false;
  function tryPlay() {
    if (started) return; started = true;
    toggle();
    document.removeEventListener('click', tryPlay);
    document.removeEventListener('keydown', tryPlay);
  }
  document.addEventListener('click', tryPlay);
  document.addEventListener('keydown', tryPlay);
})();

/* ══════════ RED CURSOR ══════════ */
(function() {
  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position:fixed;width:12px;height:12px;border-radius:0;
    background:rgba(220,38,38,.8);pointer-events:none;z-index:9999;
    mix-blend-mode:exclusion;transition:transform .1s;
    clip-path: polygon(0 0,100% 0,100% 70%,70% 100%,0 100%);
  `;
  document.body.appendChild(cursor);

  const trail = document.createElement('div');
  trail.style.cssText = `
    position:fixed;width:28px;height:28px;border:1px solid rgba(220,38,38,.3);
    border-radius:0;pointer-events:none;z-index:9998;
    transition:left .12s ease,top .12s ease;
    clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
  `;
  document.body.appendChild(trail);

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx - 6 + 'px';
    cursor.style.top  = my - 6 + 'px';
    trail.style.left  = mx - 14 + 'px';
    trail.style.top   = my - 14 + 'px';
  });

  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.style.transform = 'scale(2)'; trail.style.transform = 'scale(1.4)'; });
    el.addEventListener('mouseleave', () => { cursor.style.transform = 'scale(1)'; trail.style.transform = 'scale(1)'; });
  });
})();
