(function () {
  'use strict';

  /* Three Pillars tabbed section */
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

  /* Scroll reveal for dynamically added sections */
  if (typeof IntersectionObserver !== 'undefined') {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '-30px 0px' });
    document.querySelectorAll('.pillars-section .sr, .levels-section .sr, .features-section .sr').forEach(function (el) {
      io.observe(el);
    });
  }
})();
