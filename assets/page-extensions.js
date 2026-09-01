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
    function toggleFaq(btn) {
      var item = btn.closest('.faq-item');
      if (!item) return;
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (node) {
        node.classList.remove('open');
        var q = node.querySelector('.faq-q');
        if (q) {
          q.setAttribute('aria-expanded', 'false');
          q.setAttribute('aria-label', 'Expand answer');
        }
      });
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        btn.setAttribute('aria-label', 'Collapse answer');
      }
    }
    window.toggleFaq = window.toggleFaq || toggleFaq;

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
          item.hidden = !show;
          if (show) anyVisible = true;
        });
        group.hidden = !anyVisible;
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
        var visuallyOpen = item.classList.contains('open') ||
          (!item.classList.contains('is-closing') && getComputedStyle(menu).visibility !== 'hidden');
        closeNavDrops();
        if (visuallyOpen) {
          item.classList.add('is-closing');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.blur();
        } else {
          item.classList.remove('is-closing');
          item.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
      item.addEventListener('mouseleave', function () {
        item.classList.remove('is-closing');
      });
    });

    document.addEventListener('click', function () {
      closeNavDrops();
    });
    siteNav.querySelectorAll('.nav-drop').forEach(function (menu) {
      menu.addEventListener('click', function (e) { e.stopPropagation(); });
    });
  }
})();
