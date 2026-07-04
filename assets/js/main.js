(function () {
  "use strict";

  var body = document.body;
  var navToggle = document.querySelector("[data-nav-toggle]");
  var primaryNav = document.querySelector("[data-primary-nav]");
  var yearTargets = document.querySelectorAll("[data-current-year]");
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  body.classList.add("has-js");

  yearTargets.forEach(function (target) {
    target.textContent = String(new Date().getFullYear());
  });

  if (navToggle && primaryNav) {
    var closeNav = function () {
      body.classList.remove("nav-open");
      primaryNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation");
    };

    navToggle.addEventListener("click", function () {
      var isOpen = primaryNav.classList.toggle("is-open");
      body.classList.toggle("nav-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    primaryNav.addEventListener("click", function (event) {
      if (event.target && event.target.tagName === "A") {
        closeNav();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeNav();
      }
    });
  }

  var setupSwipeCarousel = function (options) {
    var carousel = options.carousel;
    var viewport = carousel.querySelector(options.viewportSelector);
    var cards = Array.prototype.slice.call(carousel.querySelectorAll(options.cardSelector));
    var prev = carousel.querySelector(options.prevSelector);
    var next = carousel.querySelector(options.nextSelector);
    var status = carousel.querySelector(options.statusSelector);
    var timer = null;
    var delay = options.delay || 0;
    var current = 0;

    if (!viewport || !cards.length) {
      if (status) {
        status.textContent = "";
      }
      return;
    }

    var getVisibleCount = function () {
      if (!cards[0]) {
        return 1;
      }
      var cardWidth = cards[0].getBoundingClientRect().width || viewport.clientWidth;
      return Math.max(1, Math.round(viewport.clientWidth / cardWidth));
    };

    var getStep = function () {
      return Math.max(1, getVisibleCount());
    };

    var maxIndex = function () {
      return Math.max(0, cards.length - getStep());
    };

    var syncControls = function () {
      var hasPages = cards.length > getVisibleCount();
      if (prev) {
        prev.hidden = !hasPages;
      }
      if (next) {
        next.hidden = !hasPages;
      }
      if (status && !hasPages) {
        status.textContent = "";
      }
    };

    var updateStatus = function () {
      var end = Math.min(current + getVisibleCount(), cards.length);
      if (status) {
        status.textContent = "Showing " + (current + 1) + "-" + end + " of " + cards.length;
      }
      syncControls();
    };

    var scrollToIndex = function (nextIndex, behavior) {
      var max = maxIndex();
      current = nextIndex;
      if (current > max) {
        current = 0;
      }
      if (current < 0) {
        current = max;
      }

      viewport.scrollTo({
        left: cards[current].offsetLeft - viewport.offsetLeft,
        behavior: behavior || "smooth"
      });
      updateStatus();
    };

    var stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    var start = function () {
      if (!delay || prefersReducedMotion.matches || timer || cards.length <= getVisibleCount()) {
        return;
      }
      timer = window.setInterval(function () {
        scrollToIndex(current + getStep(), "smooth");
      }, delay);
    };

    var restart = function () {
      stop();
      start();
    };

    if (prev) {
      prev.addEventListener("click", function () {
        scrollToIndex(current - getStep(), "smooth");
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        scrollToIndex(current + getStep(), "smooth");
        restart();
      });
    }

    var syncFromScroll = function () {
      var nearest = 0;
      var distance = Number.POSITIVE_INFINITY;
      cards.forEach(function (card, index) {
        var nextDistance = Math.abs(card.offsetLeft - viewport.offsetLeft - viewport.scrollLeft);
        if (nextDistance < distance) {
          distance = nextDistance;
          nearest = index;
        }
      });
      current = Math.min(nearest, maxIndex());
      updateStatus();
    };

    viewport.addEventListener("scroll", function () {
      window.clearTimeout(viewport._carouselScrollTimer);
      viewport._carouselScrollTimer = window.setTimeout(syncFromScroll, 120);
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", start);

    if (typeof prefersReducedMotion.addEventListener === "function") {
      prefersReducedMotion.addEventListener("change", function () {
        restart();
      });
    }

    window.addEventListener("resize", function () {
      scrollToIndex(current, "auto");
      restart();
    });

    scrollToIndex(0, "auto");
    start();
  };

  document.querySelectorAll("[data-video-carousel]").forEach(function (carousel) {
    setupSwipeCarousel({
      carousel: carousel,
      viewportSelector: "[data-video-viewport]",
      cardSelector: "[data-video-card]",
      prevSelector: "[data-video-prev]",
      nextSelector: "[data-video-next]",
      statusSelector: "[data-video-status]",
      delay: 12000
    });
  });

  document.querySelectorAll("[data-image-carousel]").forEach(function (carousel) {
    setupSwipeCarousel({
      carousel: carousel,
      viewportSelector: "[data-image-viewport]",
      cardSelector: ".performance-card",
      prevSelector: "[data-image-prev]",
      nextSelector: "[data-image-next]",
      statusSelector: "[data-image-status]",
      delay: 12000
    });
  });

})();
