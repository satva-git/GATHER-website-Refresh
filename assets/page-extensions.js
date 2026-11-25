/* ═════ MCP BETA: sitewide announcement bar + GATHER AI nav entry ═════
 * Injected here so every page that loads this script gets them without
 * per-page HTML edits. Must run before the nav dropdown wiring below. */
(function () {
  'use strict';
  var script = document.currentScript;
  var siteRoot = script && script.src ? new URL('../', script.src) : new URL('/', location.href);
  var MCP_URL = new URL('mcp-beta.html', siteRoot).href;
  var DISMISS_KEY = 'gn-ann-mcp-beta-dismissed';

  // Reviewer mode: ?tbc=1 reveals placeholder copy awaiting business sign-off (?tbc=0 hides it again).
  var tbc = new URLSearchParams(location.search).get('tbc');
  try {
    if (tbc !== null) sessionStorage.setItem('gn-show-tbc', tbc === '0' ? '' : '1');
    if (sessionStorage.getItem('gn-show-tbc')) document.documentElement.classList.add('show-tbc');
  } catch (e) { if (tbc && tbc !== '0') document.documentElement.classList.add('show-tbc'); }

  var dismissed = false;
  try { dismissed = localStorage.getItem(DISMISS_KEY) === '1'; } catch (e) {}
  if (!dismissed && !document.body.classList.contains('wl-page')) {
    var bar = document.createElement('div');
    bar.className = 'ann-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Announcement');
    bar.innerHTML =
      '<a href="' + MCP_URL + '"><b>NEW</b><span class="ann-long">The GATHER MCP beta waitlist is open. </span><span class="ann-short">GATHER MCP beta: </span><u>Join the waitlist</u></a>' +
      '<button type="button" class="ann-close" aria-label="Dismiss announcement">&times;</button>';
    document.body.insertBefore(bar, document.body.firstChild);
    document.documentElement.classList.add('has-ann');
    bar.querySelector('.ann-close').addEventListener('click', function () {
      bar.remove();
      document.documentElement.classList.remove('has-ann');
      try { localStorage.setItem(DISMISS_KEY, '1'); } catch (e) {}
    });
  }

  // Turn the flat "GATHER AI" nav link into a dropdown that also lists the MCP beta.
  var aiLink = document.querySelector('#nav .nav-links > li > a.nav-link--caps');
  if (aiLink && /GATHER\s*AI/i.test(aiLink.textContent)) {
    var li = aiLink.parentNode;
    li.className = 'nav-item--drop';
    li.innerHTML =
      '<button type="button" class="nav-drop-trigger nav-link--caps" aria-expanded="false" aria-haspopup="true">GATHER AI ' +
        '<svg class="nav-chevron" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<div class="nav-drop nav-drop--resources" role="menu" aria-label="GATHER AI">' +
        '<div class="nav-resources-list">' +
          '<a href="' + aiLink.getAttribute('href') + '" role="menuitem"><span class="nav-resources-ic nav-resources-ic--insights" aria-hidden="true"></span><span class="nav-resources-label">About GATHER AI</span></a>' +
          '<a href="' + MCP_URL + '" role="menuitem"><span class="nav-resources-ic nav-resources-ic--updates" aria-hidden="true"></span><span class="nav-resources-label">MCP beta waitlist</span><span class="nav-new-tag">New</span></a>' +
        '</div>' +
      '</div>';
  }
})();

(function () {
  'use strict';

  var pillarsRoot = document.getElementById('three-pillars');
  if (pillarsRoot) {
    var navItems = pillarsRoot.querySelectorAll('.pillars-nav-item');
    var panels = pillarsRoot.querySelectorAll('.pillars-panel-content');
    var dots = pillarsRoot.querySelectorAll('.pillars-dot');
    var prevBtn = pillarsRoot.querySelector('.pillars-arrow--prev');
    var nextBtn = pillarsRoot.querySelector('.pillars-arrow--next');
    var index = 0;

    function goTo(i) {
      index = Math.max(0, Math.min(panels.length - 1, i));
      navItems.forEach(function (el, j) { el.classList.toggle('is-active', j === index); });
      panels.forEach(function (el, j) { el.classList.toggle('is-active', j === index); });
      dots.forEach(function (el, j) { el.classList.toggle('is-active', j === index); });
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === panels.length - 1;
    }

    navItems.forEach(function (btn, i) {
      btn.addEventListener('click', function () { goTo(i); });
    });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); });
    });
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); });
    goTo(0);
  }

  var journeyRoot = document.getElementById('product-journey');
  if (journeyRoot) {
    // Controls may sit just outside #product-journey if markup nesting is off
    var journeyScope =
      journeyRoot.closest('#platform') ||
      journeyRoot.closest('.journey-section') ||
      journeyRoot.parentElement ||
      journeyRoot;
    var tablist = journeyRoot.querySelector('.journey-tabs');
    var steps = Array.prototype.slice.call(
      journeyRoot.querySelectorAll('.journey-tab, .journey-step')
    );
    var panels = Array.prototype.slice.call(journeyRoot.querySelectorAll('.journey-panel'));
    var dotsWrap =
      journeyRoot.querySelector('.journey-dots') ||
      journeyScope.querySelector('.journey-dots');
    var prevBtn =
      journeyRoot.querySelector('.journey-nav-btn--prev') ||
      journeyScope.querySelector('.journey-nav-btn--prev');
    var nextBtn =
      journeyRoot.querySelector('.journey-nav-btn--next') ||
      journeyScope.querySelector('.journey-nav-btn--next');
    var progressFill = journeyRoot.querySelector('.journey-tabs-track-fill') ||
      journeyRoot.querySelector('.journey-rail-progress-fill');
    var index = 0;

    steps.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'journey-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Step ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      if (dotsWrap) dotsWrap.appendChild(dot);
    });

    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.querySelectorAll('.journey-dot')) : [];

    function updateProgress() {
      if (!progressFill || !steps.length) return;
      var segment = 100 / steps.length;
      if (progressFill.classList.contains('journey-tabs-track-fill') ||
          progressFill.closest('.journey-tabs-track')) {
        progressFill.style.width = segment + '%';
        progressFill.style.height = '100%';
        progressFill.style.transform = 'translateX(' + (index * 100) + '%)';
      } else {
        var pct = steps.length <= 1 ? 100 : (index / (steps.length - 1)) * 100;
        progressFill.style.height = pct + '%';
      }
    }

    function scrollTabIntoView(i) {
      var tab = steps[i];
      if (!tab || typeof tab.scrollIntoView !== 'function') return;
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    function goTo(i) {
      index = Math.max(0, Math.min(panels.length - 1, i));
      steps.forEach(function (el, j) {
        var active = j === index;
        el.classList.toggle('is-active', active);
        el.classList.toggle('is-complete', j < index);
        el.setAttribute('aria-selected', active ? 'true' : 'false');
        el.setAttribute('tabindex', active ? '0' : '-1');
      });
      panels.forEach(function (el, j) {
        var active = j === index;
        el.classList.toggle('is-active', active);
        el.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (el, j) { el.classList.toggle('is-active', j === index); });
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === panels.length - 1;
      updateProgress();
      scrollTabIntoView(index);
    }

    steps.forEach(function (btn, i) {
      btn.addEventListener('click', function () { goTo(i); });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goTo(i);
        }
      });
    });

    if (tablist) {
      tablist.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          goTo(index + 1);
          if (steps[index]) steps[index].focus();
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goTo(index - 1);
          if (steps[index]) steps[index].focus();
        }
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); });

    goTo(0);
  }

  /* Click-to-zoom lightbox for content images site-wide */
  (function initImageZoom() {
    function isZoomableImage(img) {
      if (!img || img.tagName !== 'IMG') return false;
      if (img.classList.contains('journey-lightbox-img')) return false;
      if (img.classList.contains('featured-logo')) return false;
      if (img.hasAttribute('data-no-zoom')) return false;
      if (img.closest('.journey-lightbox, header, .subpage-nav, footer, .subpage-foot, nav')) return false;
      if (img.closest('.journey-visual-frame, .screenshot-frame--filled')) return true;
      var src = img.getAttribute('src') || '';
      return src.indexOf('assets/images/') !== -1;
    }

    var zoomImgs = Array.prototype.slice.call(document.querySelectorAll('img')).filter(isZoomableImage);
    if (!zoomImgs.length) return;

    var lightbox = document.createElement('div');
    lightbox.className = 'journey-lightbox';
    lightbox.id = 'journey-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Enlarged image');
    lightbox.hidden = true;
    lightbox.innerHTML =
      '<div class="journey-lightbox-dialog">' +
        '<button type="button" class="journey-lightbox-close" aria-label="Close enlarged image">&times;</button>' +
        '<img class="journey-lightbox-img" alt="" />' +
      '</div>';
    document.body.appendChild(lightbox);

    var lightboxImg = lightbox.querySelector('.journey-lightbox-img');
    var closeBtn = lightbox.querySelector('.journey-lightbox-close');
    var lastFocus = null;

    function openZoom(img) {
      lastFocus = document.activeElement;
      var src = img.currentSrc || img.src || '';
      /* Force GIF reload so animation restarts in the lightbox */
      if (/\.gif(\?|#|$)/i.test(src)) {
        src = src.replace(/([?&])v=[^&]*&?/, '$1').replace(/[?&]$/, '');
        src += (src.indexOf('?') === -1 ? '?' : '&') + 'zoom=' + Date.now();
      }
      lightboxImg.src = src;
      lightboxImg.alt = img.alt || 'Enlarged image';
      lightbox.hidden = false;
      void lightbox.offsetWidth;
      lightbox.classList.add('is-open');
      document.body.classList.add('journey-lightbox-open');
      closeBtn.focus();
    }

    function closeZoom() {
      if (!lightbox.classList.contains('is-open')) return;
      lightbox.classList.remove('is-open');
      document.body.classList.remove('journey-lightbox-open');
      window.setTimeout(function () {
        if (!lightbox.classList.contains('is-open')) {
          lightbox.hidden = true;
          lightboxImg.removeAttribute('src');
        }
      }, 220);
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    zoomImgs.forEach(function (img) {
      img.classList.add('journey-zoomable');
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute(
        'aria-label',
        (img.alt ? img.alt + '. ' : '') + 'Click to enlarge'
      );
      img.addEventListener('click', function () { openZoom(img); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openZoom(img);
        }
      });
    });

    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeZoom();
    });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target === lightboxImg) closeZoom();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
        e.preventDefault();
        closeZoom();
      }
    });
  })();

  /* Chromium often paints only the first GIF frame until the URL is reloaded in view */
  (function restartVisibleGifs() {
    function replay(img) {
      var src = img.getAttribute('src') || '';
      if (!/\.gif(\?|#|$)/i.test(src)) return;
      var next = src.replace(/([?&])replay=\d+/g, '$1').replace(/[?&]$/, '');
      next += (next.indexOf('?') === -1 ? '?' : '&') + 'replay=' + Date.now();
      img.src = next;
    }
    var gifs = Array.prototype.slice.call(document.querySelectorAll('img[src*=".gif"]'));
    if (!gifs.length) return;
    if (typeof IntersectionObserver === 'undefined') {
      gifs.forEach(replay);
      return;
    }
    var gifIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        replay(entry.target);
        gifIo.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    gifs.forEach(function (img) { gifIo.observe(img); });
  })();

  if (typeof IntersectionObserver !== 'undefined') {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '-30px 0px' });
    document.querySelectorAll('.pillars-section .sr, .unrivaled-data-integrity-main-box .sr, .levels-section .sr, .journey-section .sr, #gather-difference .sr, .cta .sr').forEach(function (el) {
      io.observe(el);
    });
  }

  (function initKnowledgeCentre() {
    function initFaqAccordions() {
      document.querySelectorAll('.faq-item').forEach(function (details) {
        details.addEventListener('toggle', function () {
          if (!details.open) return;
          document.querySelectorAll('.faq-item').forEach(function (other) {
            if (other !== details && other.open) other.removeAttribute('open');
          });
        });
      });
    }
    initFaqAccordions();

    var topicBtns = document.querySelectorAll('.kc-topic[data-kc-topic]');
    var groups = document.querySelectorAll('[data-kc-group]');
    var findInput = document.querySelector('[data-kc-find]');

    function applyFaqFilter() {
      if (!groups.length) return;
      var active = document.querySelector('.kc-topic.is-active');
      var topic = active ? active.getAttribute('data-kc-topic') : 'all';
      var query = findInput ? findInput.value.trim().toLowerCase() : '';
      groups.forEach(function (group) {
        var matchTopic = topic === 'all' || group.getAttribute('data-kc-group') === topic;
        var items = group.querySelectorAll('.faq-item');
        var anyVisible = false;
        items.forEach(function (item) {
          var text = item.textContent.toLowerCase();
          var matchQuery = !query || text.indexOf(query) !== -1;
          var show = matchTopic && matchQuery;
          item.classList.toggle('is-faq-filtered', !show);
          if (show) item.removeAttribute('aria-hidden');
          else item.setAttribute('aria-hidden', 'true');
          if (!show && item.open) item.removeAttribute('open');
          if (show) anyVisible = true;
        });
        group.classList.toggle('is-faq-filtered', !anyVisible);
        if (anyVisible) group.removeAttribute('aria-hidden');
        else group.setAttribute('aria-hidden', 'true');
      });
    }

    topicBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        topicBtns.forEach(function (node) { node.classList.remove('is-active'); });
        btn.classList.add('is-active');
        applyFaqFilter();
      });
    });
    if (findInput) findInput.addEventListener('input', applyFaqFilter);

    var listingFind = document.querySelector('[data-kc-listing-find]');
    var filterBtns = document.querySelectorAll('[data-kc-filter-btn]');
    var filterCards = document.querySelectorAll('[data-kc-card]');
    var emptyPanel = document.querySelector('[data-kc-page="landing"] [data-kc-empty]');
    var emptyCopy = document.querySelector('[data-kc-page="landing"] [data-kc-empty-copy]');
    var emptyReset = document.querySelector('[data-kc-page="landing"] [data-kc-empty-reset]');
    var listingGrid = document.querySelector('[data-kc-page="landing"] [data-kc-list]');

    function currentListingFilter() {
      var active = document.querySelector('[data-kc-filter-btn].is-active');
      return active ? active.getAttribute('data-kc-filter-btn') : 'all';
    }

    function applyCardFilter(value, opts) {
      opts = opts || {};
      if (value) {
        filterBtns.forEach(function (node) {
          var on = node.getAttribute('data-kc-filter-btn') === value;
          node.classList.toggle('is-active', on);
          node.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        if (!opts.skipHash) {
          var hash = value === 'all' ? '' : '#filter=' + encodeURIComponent(value);
          var next = window.location.pathname + window.location.search + hash;
          if (window.location.pathname + window.location.search + window.location.hash !== next) {
            history.replaceState(null, '', next);
          }
        }
      }
      var cat = currentListingFilter();
      var q = listingFind ? listingFind.value.trim().toLowerCase() : '';
      var visible = 0;
      filterCards.forEach(function (card) {
        var matchCat = cat === 'all' || card.getAttribute('data-kc-card') === cat;
        var hay = ((card.getAttribute('data-kc-title') || '') + ' ' + card.textContent).toLowerCase();
        var matchQ = !q || hay.indexOf(q) !== -1;
        var show = matchCat && matchQ;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (listingGrid && listingGrid.classList.contains('kc-grid')) {
        listingGrid.classList.toggle('kc-grid--pair', visible === 2);
        listingGrid.classList.toggle('kc-grid--one', visible === 1);
      }
      var shelves = document.querySelectorAll('[data-kc-page="landing"] [data-kc-shelf]');
      var visibleShelves = 0;
      shelves.forEach(function (shelf) {
        var id = shelf.getAttribute('data-kc-shelf');
        var matchCat = cat === 'all' || id === cat;
        var cards = shelf.querySelectorAll('[data-kc-card]');
        var anyCard = false;
        cards.forEach(function (card) {
          if (!card.hidden) anyCard = true;
        });
        var isSoon = cards.length === 0;
        var shelfHay = (shelf.getAttribute('data-kc-title') || '').toLowerCase();
        var show;
        if (!matchCat) show = false;
        else if (isSoon) show = !q || shelfHay.indexOf(q) !== -1;
        else show = anyCard;
        shelf.hidden = !show;
        if (show) visibleShelves += 1;
      });
      if (emptyPanel) {
        var hasContent = shelves.length ? visibleShelves > 0 : visible > 0;
        emptyPanel.hidden = hasContent;
        if (emptyCopy) {
          if (q && !hasContent) {
            emptyCopy.textContent = 'No resources match “' + listingFind.value.trim() + '”. Try another term, or view all resources.';
          } else if (cat !== 'all' && !hasContent) {
            emptyCopy.textContent = 'This collection is still being built. Intercompany Control already has FAQs and a comparison you can browse.';
          }
        }
      }
    }

    if (filterBtns.length) {
      filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          applyCardFilter(btn.getAttribute('data-kc-filter-btn'));
        });
      });
      if (listingFind) {
        listingFind.addEventListener('input', function () {
          applyCardFilter(currentListingFilter(), { skipHash: true });
        });
      }
      if (emptyReset) {
        emptyReset.addEventListener('click', function () {
          if (listingFind) listingFind.value = '';
          applyCardFilter('all');
        });
      }
      window.addEventListener('hashchange', function () {
        var match = (window.location.hash || '').match(/^#filter=([a-z0-9-]+)$/i);
        applyCardFilter(match ? match[1] : 'all', { skipHash: true });
      });
      var hashMatch = (window.location.hash || '').match(/^#filter=([a-z0-9-]+)$/i);
      applyCardFilter(hashMatch && document.querySelector('[data-kc-filter-btn="' + hashMatch[1] + '"]') ? hashMatch[1] : 'all', { skipHash: true });
    }

    var tocLinks = document.querySelectorAll('.kc-toc a[href^="#"]');
    if (tocLinks.length && typeof IntersectionObserver !== 'undefined') {
      var sections = [];
      tocLinks.forEach(function (link) {
        var id = decodeURIComponent(link.getAttribute('href').slice(1));
        var el = document.getElementById(id);
        if (el) sections.push({ el: el, link: link });
      });
      var tocIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          tocLinks.forEach(function (link) { link.classList.remove('is-active'); });
          sections.forEach(function (section) {
            if (section.el === entry.target) section.link.classList.add('is-active');
          });
        });
      }, { rootMargin: '-28% 0px -58% 0px', threshold: 0 });
      sections.forEach(function (section) { tocIo.observe(section.el); });
    }
  })();

  /* Homepage-matching site nav */
  var siteNav = document.getElementById('nav');
  var navProgress = document.getElementById('nav-progress');
  if (siteNav && !siteNav.dataset.navBound) {
    siteNav.dataset.navBound = '1';
    window.addEventListener('scroll', function () {
      siteNav.classList.toggle('stuck', window.scrollY > 40);
      if (navProgress) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        var pct = h > 0 ? (window.scrollY / h) * 100 : 0;
        navProgress.style.width = pct + '%';
      }
    }, { passive: true });

    function closeNavDrops(except) {
      siteNav.querySelectorAll('.nav-item--drop').forEach(function (item) {
        if (except && item === except) return;
        item.classList.remove('open', 'is-closing');
        var t = item.querySelector('.nav-drop-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }

    siteNav.querySelectorAll('.nav-item--drop').forEach(function (item) {
      var trigger = item.querySelector('.nav-drop-trigger');
      var menu = item.querySelector('.nav-drop');
      if (!trigger || !menu) return;
      
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        
        var isOpen = item.classList.contains('open');
        closeNavDrops();
        
        if (isOpen) {
          item.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.blur();
        } else {
          item.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
      
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && item.classList.contains('open')) {
          e.preventDefault();
          item.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      });
      
      item.addEventListener('mouseleave', function () {
        item.classList.remove('is-closing');
      });
    });

    document.addEventListener('click', function (e) {
      if (!siteNav.contains(e.target)) {
        closeNavDrops();
      }
    }, true);
    
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeNavDrops();
      }
    });
    
    siteNav.querySelectorAll('.nav-drop').forEach(function (menu) {
      menu.addEventListener('click', function (e) {
        e.stopPropagation();
        
        var link = e.target.closest('a');
        if (link) {
          var item = link.closest('.nav-item--drop');
          if (item) {
            item.classList.remove('open');
            var trigger = item.querySelector('.nav-drop-trigger');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
          }
        }
      });
    });
  }
})();

/* ═════ GN SITE HEADER: desktop menus + mobile drawer ═════
 * Only runs on pages that use the gn-system header (.gn-header). */
(function () {
  'use strict';
  var header = document.querySelector('.gn-header');
  if (!header || header.dataset.gnBound) return;
  header.dataset.gnBound = '1';

  var hoverMq = window.matchMedia('(hover: hover) and (pointer: fine)');
  var items = Array.prototype.slice.call(header.querySelectorAll('.gn-nav-item'));

  function setItem(item, open) {
    item.classList.toggle('is-open', open);
    var t = item.querySelector('.gn-nav-trigger');
    if (t) t.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function closeAll(except) {
    items.forEach(function (item) { if (item !== except) setItem(item, false); });
  }

  items.forEach(function (item) {
    var trigger = item.querySelector('.gn-nav-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var open = !item.classList.contains('is-open');
      closeAll(item);
      setItem(item, open);
    });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && item.classList.contains('is-open')) {
        e.stopPropagation();
        setItem(item, false);
        trigger.focus();
      }
    });
    item.addEventListener('focusout', function (e) {
      if (!item.contains(e.relatedTarget)) setItem(item, false);
    });
    item.addEventListener('mouseleave', function () {
      if (hoverMq.matches && !item.contains(document.activeElement)) setItem(item, false);
    });
  });

  document.addEventListener('click', function (e) {
    if (!header.contains(e.target)) closeAll();
  });

  /* Mobile drawer */
  var toggle = header.querySelector('.gn-menu-toggle');
  var drawer = toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;
  if (!toggle || !drawer) return;
  var desktopMq = window.matchMedia('(min-width: 1081px)');

  function focusables() {
    return [toggle].concat(Array.prototype.slice.call(
      drawer.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; }));
  }
  function setDrawer(open, restoreFocus) {
    drawer.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    header.classList.toggle('is-menu-open', open);
    document.body.classList.toggle('gn-drawer-open', open);
    if (open) {
      var first = drawer.querySelector('.gn-drawer-trigger, .gn-drawer-link');
      if (first) first.focus();
    } else if (restoreFocus) {
      toggle.focus();
    }
  }

  toggle.addEventListener('click', function () {
    setDrawer(!drawer.classList.contains('is-open'), true);
  });

  drawer.querySelectorAll('.gn-drawer-trigger').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
    });
  });

  drawer.addEventListener('click', function (e) {
    if (e.target.closest('a[href]')) setDrawer(false, false);
  });

  document.addEventListener('keydown', function (e) {
    if (!drawer.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      setDrawer(false, true);
      return;
    }
    if (e.key !== 'Tab') return;
    var list = focusables();
    if (!list.length) return;
    var first = list[0];
    var last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  desktopMq.addEventListener('change', function (e) {
    if (e.matches && drawer.classList.contains('is-open')) setDrawer(false, false);
  });
})();

/* ═════ MCP BETA WAITLIST FORM ═════
 * Shared by the homepage #mcp-beta section and /mcp-beta.
 * Spam: hidden honeypot field (bots that fill it get a fake success, nothing is
 * sent) + time-to-submit sent as elapsed_ms for server-side filtering.
 * Duplicates: remembered per browser (hashed email) and a 409 response from
 * the endpoint is shown as "already on the list". */
(function () {
  'use strict';

  // TBC: mailing-list provider not confirmed yet. Leave empty until it is:
  // the form validates but sends nothing and shows a "not open yet" message.
  // It will POST JSON: { list, email, consent_beta, consent_beta_text,
  // consent_marketing, consent_marketing_text, source, submitted_at,
  // elapsed_ms, utm_*, ref }.
  var WAITLIST_ENDPOINT = '';
  // TBC: confirm the production URL of the waitlist page.
  var SHARE_URL = 'https://gather.nexus/mcp-beta';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var JOINED_KEY = 'gn-waitlist-joined';
  var UTM_KEY = 'gn-utm';

  // Keep first-touch campaign params for the session, so a visitor who lands
  // on another page from a shared link and signs up later is still attributed.
  var params = {};
  new URLSearchParams(location.search).forEach(function (v, k) {
    if (/^utm_[a-z]+$|^ref$/.test(k)) params[k] = v.slice(0, 200);
  });
  try {
    if (Object.keys(params).length) sessionStorage.setItem(UTM_KEY, JSON.stringify(params));
    else params = JSON.parse(sessionStorage.getItem(UTM_KEY) || '{}');
  } catch (e) {}

  function hash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }
  function joined() {
    try { return JSON.parse(localStorage.getItem(JOINED_KEY) || '{}'); } catch (e) { return {}; }
  }
  function hasJoined(list, email) {
    var j = joined();
    return !!(j[list] && j[list].indexOf(hash(email)) > -1);
  }
  function rememberJoined(list, email) {
    try {
      var j = joined();
      (j[list] = j[list] || []).push(hash(email));
      localStorage.setItem(JOINED_KEY, JSON.stringify(j));
    } catch (e) {}
  }
  function shareLink(source) {
    return SHARE_URL + '?utm_source=' + source + '&utm_medium=referral&utm_campaign=mcp-beta';
  }
  function labelText(input) {
    var span = input.closest('label').querySelector('[data-consent-text]');
    return span ? span.textContent.replace(/\s+/g, ' ').trim() : '';
  }

  document.querySelectorAll('form[data-waitlist]').forEach(function (form) {
    var list = form.getAttribute('data-waitlist');
    var email = form.elements.email;
    var beta = form.elements.consent_beta;
    var marketing = form.elements.consent_marketing;
    var honeypot = form.elements.website;
    var button = form.querySelector('.wl-submit');
    var status = form.querySelector('.wl-status');
    var doneTitle = form.querySelector('.wl-done-title');
    var doneText = form.querySelector('.wl-done-text');
    var copyBtn = form.querySelector('[data-share="copy"]');
    var nativeBtn = form.querySelector('[data-share="native"]');
    var copyLabel = copyBtn ? copyBtn.querySelector('span').textContent : '';
    var startedAt = Date.now();
    var busy = false;

    function say(msg, ok) {
      status.textContent = msg;
      status.className = 'wl-status ' + (msg ? (ok ? 'wl-status--ok' : 'wl-status--err') : '');
    }
    function invalid(input, on) {
      if (on) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
      if (input.type === 'checkbox') input.closest('.wl-consent').classList.toggle('is-invalid', on);
    }
    function showDone(addr, already) {
      doneTitle.textContent = already ? "You're already on the waitlist" : "You're on the waitlist";
      doneText.textContent = already
        ? 'We already have ' + addr + ' on the GATHER MCP beta waitlist. No need to sign up again.'
        : "Thanks! We'll email " + addr + ' about the GATHER MCP beta.';
      form.classList.add('is-done');
      say('', true);
      doneTitle.focus();
    }

    email.addEventListener('input', function () { invalid(email, false); });
    beta.addEventListener('change', function () { invalid(beta, false); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      var addr = email.value.trim().toLowerCase();
      var bad = [];
      invalid(email, !EMAIL_RE.test(addr));
      if (!EMAIL_RE.test(addr)) bad.push([email, 'Enter a valid email address, like name@company.com.']);
      invalid(beta, !beta.checked);
      if (!beta.checked) bad.push([beta, 'Tick the box to confirm you want to join the beta waitlist.']);
      if (bad.length) {
        say(bad.map(function (b) { return b[1]; }).join(' '), false);
        bad[0][0].focus();
        return;
      }

      // Honeypot: invisible to people, so anything in it is a bot. Fake success.
      if (honeypot && honeypot.value) return showDone(addr, false);

      if (hasJoined(list, addr)) return showDone(addr, true);

      if (!WAITLIST_ENDPOINT) {
        return say("The waitlist isn't open for sign-ups yet. Please check back soon.", false);
      }

      var payload = {
        list: list,
        email: addr,
        consent_beta: true,
        consent_beta_text: labelText(beta),
        consent_marketing: !!(marketing && marketing.checked),
        consent_marketing_text: marketing && marketing.checked ? labelText(marketing) : null,
        source: location.pathname,
        submitted_at: new Date().toISOString(),
        elapsed_ms: Date.now() - startedAt
      };
      Object.keys(params).forEach(function (k) { payload[k] = params[k]; });

      busy = true;
      button.setAttribute('aria-disabled', 'true');
      say('Adding you to the waitlist…', true);
      fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (res.status === 409) { rememberJoined(list, addr); return showDone(addr, true); }
        if (!res.ok) throw new Error('HTTP ' + res.status);
        rememberJoined(list, addr);
        showDone(addr, false);
      }).catch(function () {
        say("Sorry, we couldn't add you just now. Please try again in a moment.", false);
      }).then(function () {
        busy = false;
        button.removeAttribute('aria-disabled');
      });
    });

    // Post-signup sharing
    var shareText = 'Join the GATHER MCP beta waitlist';
    form.querySelectorAll('[data-share-to]').forEach(function (a) {
      var kind = a.getAttribute('data-share-to');
      var url = shareLink(kind);
      a.href = kind === 'linkedin'
        ? 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url)
        : 'mailto:?subject=' + encodeURIComponent(shareText) + '&body=' + encodeURIComponent(shareText + ': ' + url);
    });
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var url = shareLink('copy');
        var ok = function () {
          copyBtn.querySelector('span').textContent = 'Link copied';
          say('Link copied to your clipboard.', true);
          setTimeout(function () { copyBtn.querySelector('span').textContent = copyLabel; }, 2500);
        };
        var fallback = function () {
          var t = document.createElement('textarea');
          t.value = url; t.setAttribute('readonly', ''); t.style.position = 'absolute'; t.style.left = '-9999px';
          document.body.appendChild(t); t.select();
          try { document.execCommand('copy'); ok(); } catch (err) { say('Copy this link: ' + url, true); }
          t.remove();
        };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(ok, fallback);
        else fallback();
      });
    }
    if (nativeBtn && navigator.share) {
      nativeBtn.hidden = false;
      nativeBtn.addEventListener('click', function () {
        navigator.share({ title: shareText, url: shareLink('native') }).catch(function () {});
      });
    }
  });

  // "Join the waitlist" buttons further down a page: scroll to the form and focus the email field.
  document.querySelectorAll('[data-wl-focus]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      var input = target && target.querySelector('form[data-waitlist] input[type="email"]');
      if (!input) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(function () { input.focus({ preventScroll: true }); }, 400);
    });
  });
})();
