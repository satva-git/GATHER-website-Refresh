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
    var tablist = journeyRoot.querySelector('.journey-tabs');
    var steps = Array.prototype.slice.call(
      journeyRoot.querySelectorAll('.journey-tab, .journey-step')
    );
    var panels = Array.prototype.slice.call(journeyRoot.querySelectorAll('.journey-panel'));
    var dotsWrap = journeyRoot.querySelector('.journey-dots');
    var prevBtn = journeyRoot.querySelector('.journey-nav-btn--prev');
    var nextBtn = journeyRoot.querySelector('.journey-nav-btn--next');
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
