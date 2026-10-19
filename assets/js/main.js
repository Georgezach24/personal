/* Georgios Zachos · personal site scripts */
(function () {
  'use strict';

  var config = window.SITE_CONFIG || {};
  var dict = window.I18N || { en: {} };
  var root = document.documentElement;

  // localStorage can throw (private mode, blocked storage), so wrap every access.
  var store = {
    get: function (key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set: function (key, value) { try { localStorage.setItem(key, value); } catch (e) { /* ignore */ } }
  };

  /* ---------------- Language ---------------- */
  var lang = store.get('lang') || ((navigator.language || '').toLowerCase().indexOf('el') === 0 ? 'el' : 'en');
  if (!dict[lang]) lang = 'en';

  function t(key) {
    return (dict[lang] && dict[lang][key]) || dict.en[key] || key;
  }

  var langListeners = [];

  function applyLanguage() {
    root.setAttribute('lang', lang);
    document.title = t('meta.title');
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    var toggle = document.getElementById('langToggle');
    if (toggle) {
      toggle.querySelector('.lang-label').textContent = lang === 'en' ? 'ΕΛ' : 'EN';
      toggle.setAttribute('aria-label', t('nav.langSwitch'));
      toggle.setAttribute('title', t('nav.langSwitch'));
    }
    langListeners.forEach(function (fn) { fn(); });
  }

  document.getElementById('langToggle').addEventListener('click', function () {
    lang = lang === 'en' ? 'el' : 'en';
    store.set('lang', lang);
    applyLanguage();
  });

  /* ---------------- Theme ---------------- */
  document.getElementById('themeToggle').addEventListener('click', function () {
    var next = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-bs-theme', next);
    store.set('theme', next);
  });

  /* ---------------- Navbar & back-to-top ---------------- */
  var nav = document.getElementById('mainNav');
  var toTop = document.getElementById('toTop');

  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('scrolled', y > 10);
    toTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', function () { window.scrollTo({ top: 0 }); });

  // Collapse the mobile menu after choosing a section.
  var navLinks = document.getElementById('navLinks');
  navLinks.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      if (navLinks.classList.contains('show') && window.bootstrap) {
        bootstrap.Collapse.getOrCreateInstance(navLinks, { toggle: false }).hide();
      }
    });
  });

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- Email links ---------------- */
  var emailAddress = config.email ? config.email.user + '@' + config.email.domain : '';
  if (emailAddress) {
    document.querySelectorAll('.js-email-link').forEach(function (a) {
      a.setAttribute('href', 'mailto:' + emailAddress);
    });
    document.querySelectorAll('.js-email-text').forEach(function (a) {
      a.textContent = emailAddress;
    });
  }

  /* ---------------- GitHub repositories ---------------- */
  var LANG_COLORS = {
    'C++': '#f34b7d', C: '#555555', 'C#': '#178600', Java: '#b07219', Python: '#3572a5',
    JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26', CSS: '#563d7c',
    PHP: '#4f5d95', MATLAB: '#e16737', 'Jupyter Notebook': '#da5b0b', Shell: '#89e051'
  };
  var repoGrid = document.getElementById('repoGrid');
  var repos = null;
  var repoState = 'loading';

  function renderRepos() {
    repoGrid.textContent = '';

    if (repoState !== 'ready' || !repos.length) {
      var msg = document.createElement('p');
      msg.className = 'text-body-secondary mb-0';
      msg.textContent = t(repoState === 'loading' ? 'proj.loading' : repoState === 'error' ? 'proj.error' : 'proj.empty');
      repoGrid.appendChild(msg);
      return;
    }

    var dateFmt = new Intl.DateTimeFormat(lang === 'el' ? 'el-GR' : 'en-GB', { month: 'short', year: 'numeric' });

    repos.forEach(function (repo) {
      var col = document.createElement('div');
      col.className = 'col-sm-6 col-lg-4';

      var card = document.createElement('a');
      card.className = 'repo-card';
      card.href = repo.html_url;
      card.target = '_blank';
      card.rel = 'noopener';

      var name = document.createElement('span');
      name.className = 'repo-name';
      var icon = document.createElement('i');
      icon.className = 'bi bi-journal-code';
      name.appendChild(icon);
      name.appendChild(document.createTextNode(repo.name.replace(/[-_]/g, ' ')));

      var desc = document.createElement('p');
      desc.className = 'repo-desc';
      desc.textContent = repo.description || t('proj.noDesc');

      var meta = document.createElement('div');
      meta.className = 'repo-meta';
      if (repo.language) {
        var langEl = document.createElement('span');
        var dot = document.createElement('span');
        dot.className = 'lang-dot';
        if (LANG_COLORS[repo.language]) dot.style.background = LANG_COLORS[repo.language];
        langEl.appendChild(dot);
        langEl.appendChild(document.createTextNode(repo.language));
        meta.appendChild(langEl);
      }
      if (repo.stargazers_count) {
        var stars = document.createElement('span');
        stars.innerHTML = '<i class="bi bi-star"></i> ';
        stars.appendChild(document.createTextNode(String(repo.stargazers_count)));
        meta.appendChild(stars);
      }
      var updated = document.createElement('span');
      updated.textContent = t('proj.updated') + ' ' + dateFmt.format(new Date(repo.pushed_at));
      meta.appendChild(updated);

      card.appendChild(name);
      card.appendChild(desc);
      card.appendChild(meta);
      col.appendChild(card);
      repoGrid.appendChild(col);
    });
  }

  function loadRepos() {
    if (!repoGrid || !config.githubUser) return;

    var hidden = (config.hiddenRepos || []).map(function (n) { return n.toLowerCase(); });
    var cacheKey = 'repos:' + config.githubUser;

    function useData(data) {
      repos = data
        .filter(function (r) { return !r.fork && !r.archived && hidden.indexOf(r.name.toLowerCase()) === -1; })
        .sort(function (a, b) { return new Date(b.pushed_at) - new Date(a.pushed_at); })
        .slice(0, config.maxRepos || 6);
      repoState = 'ready';
      renderRepos();
    }

    // Cache for an hour: GitHub allows only 60 unauthenticated API calls per hour per IP.
    try {
      var cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
      if (cached && Date.now() - cached.time < 3600000) { useData(cached.data); return; }
    } catch (e) { /* ignore */ }

    fetch('https://api.github.com/users/' + encodeURIComponent(config.githubUser) + '/repos?per_page=100&sort=pushed')
      .then(function (res) {
        if (!res.ok) throw new Error('GitHub API ' + res.status);
        return res.json();
      })
      .then(function (data) {
        try { sessionStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), data: data })); } catch (e) { /* ignore */ }
        useData(data);
      })
      .catch(function () {
        repoState = 'error';
        renderRepos();
      });
  }

  langListeners.push(function () { if (repoGrid) renderRepos(); });

  /* ---------------- Contact form ---------------- */
  var form = document.getElementById('contactForm');
  var statusEl = document.getElementById('formStatus');
  var statusKey = null;
  var statusType = null;

  function setStatus(key, type) {
    statusKey = key;
    statusType = type;
    statusEl.className = 'form-status' + (type ? ' is-' + type : '');
    statusEl.textContent = key ? t(key) : '';
  }
  langListeners.push(function () { setStatus(statusKey, statusType); });

  function setBusy(busy) {
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = busy;
    btn.querySelector('.spinner-border').classList.toggle('d-none', !busy);
    var label = btn.querySelector('.btn-label');
    label.setAttribute('data-i18n', busy ? 'form.sending' : 'form.send');
    label.textContent = t(busy ? 'form.sending' : 'form.send');
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      setStatus(null);

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        var firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var data = new FormData(form);

      // Bots fill the hidden field; quietly pretend everything worked.
      if (data.get('_gotcha')) {
        form.reset();
        setStatus('form.success', 'success');
        return;
      }

      var endpoint = (config.contactEndpoint || '').trim();

      // No backend configured: hand the message to the visitor's email app.
      if (!endpoint) {
        var subject = data.get('subject') || t('form.defaultSubject');
        var body = data.get('message') + '\n\n— ' + data.get('name') + ' <' + data.get('email') + '>';
        window.location.href = 'mailto:' + emailAddress +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);
        setStatus('form.mailto', 'success');
        return;
      }

      setBusy(true);
      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (json) {
            if (!res.ok || json.ok === false) throw new Error(json.error || 'Request failed');
          });
        })
        .then(function () {
          form.reset();
          form.classList.remove('was-validated');
          setStatus('form.success', 'success');
        })
        .catch(function () {
          setStatus('form.error', 'error');
        })
        .then(function () { setBusy(false); });
    });
  }

  /* ---------------- Misc ---------------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  applyLanguage();
  loadRepos();
})();
