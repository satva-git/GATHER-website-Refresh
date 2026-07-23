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
})();
