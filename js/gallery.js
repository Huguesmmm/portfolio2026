/**
 * Gallery Module
 * Handles lightbox and lazy loading
 */

(function() {
  'use strict';

  // ==========================================================================
  // State
  // ==========================================================================
  const state = {
    lightboxOpen: false,
    currentIndex: 0,
    images: [],
  };

  // ==========================================================================
  // DOM Elements
  // ==========================================================================
  const elements = {
    lightbox: document.getElementById('lightbox'),
    lightboxImage: null,
    lightboxCaption: null,
    closeBtn: null,
    prevBtn: null,
    nextBtn: null,
    galleryItems: null,
  };

  // ==========================================================================
  // Initialization
  // ==========================================================================
  function init() {
    cacheElements();
    collectImages();
    bindEvents();
    initLazyLoading();
  }

  function cacheElements() {
    elements.lightboxImage = elements.lightbox.querySelector('.lightbox-image');
    elements.lightboxCaption = elements.lightbox.querySelector('.lightbox-caption');
    elements.closeBtn = elements.lightbox.querySelector('.lightbox-close');
    elements.prevBtn = elements.lightbox.querySelector('.lightbox-nav--prev');
    elements.nextBtn = elements.lightbox.querySelector('.lightbox-nav--next');
    elements.galleryItems = document.querySelectorAll('.gallery-item');
  }

  function collectImages() {
    const images = document.querySelectorAll('.gallery-image');
    state.images = Array.from(images).map((img, index) => ({
      src: img.dataset.full || img.src,
      alt: img.alt,
      caption: img.closest('.gallery-frame').querySelector('.gallery-caption')?.textContent || '',
      index,
    }));
  }

  // ==========================================================================
  // Event Binding
  // ==========================================================================
  function bindEvents() {
    // Gallery image clicks
    document.querySelectorAll('.gallery-frame').forEach((frame, index) => {
      frame.addEventListener('click', () => openLightbox(index));
    });

    // Lightbox controls
    elements.closeBtn.addEventListener('click', closeLightbox);
    elements.prevBtn.addEventListener('click', showPrevious);
    elements.nextBtn.addEventListener('click', showNext);

    // Backdrop click to close
    elements.lightbox.addEventListener('click', (e) => {
      if (e.target === elements.lightbox) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', handleKeydown);
  }

  function handleKeydown(e) {
    if (!state.lightboxOpen) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        showPrevious();
        break;
      case 'ArrowRight':
        showNext();
        break;
    }
  }

  // ==========================================================================
  // Lightbox Functions
  // ==========================================================================
  function openLightbox(index) {
    state.currentIndex = index;
    state.lightboxOpen = true;
    updateLightboxContent();
    elements.lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Focus management for accessibility
    elements.closeBtn.focus();
  }

  function closeLightbox() {
    state.lightboxOpen = false;
    elements.lightbox.classList.remove('is-open');
    document.body.style.overflow = '';

    // Return focus to the clicked image
    const frame = elements.galleryItems[state.currentIndex]?.querySelector('.gallery-frame');
    if (frame) frame.focus();
  }

  function showPrevious() {
    state.currentIndex = (state.currentIndex - 1 + state.images.length) % state.images.length;
    updateLightboxContent();
  }

  function showNext() {
    state.currentIndex = (state.currentIndex + 1) % state.images.length;
    updateLightboxContent();
  }

  function updateLightboxContent() {
    const image = state.images[state.currentIndex];
    if (!image) return;

    // Fade out effect
    elements.lightboxImage.style.opacity = '0';
    elements.lightboxImage.style.transform = 'scale(0.95)';

    // Load new image
    setTimeout(() => {
      elements.lightboxImage.src = image.src;
      elements.lightboxImage.alt = image.alt;
      elements.lightboxCaption.textContent = image.caption;

      // Fade in after image loads
      elements.lightboxImage.onload = () => {
        elements.lightboxImage.style.opacity = '1';
        elements.lightboxImage.style.transform = 'scale(1)';
      };
    }, 150);
  }

  // ==========================================================================
  // Lazy Loading
  // ==========================================================================
  function initLazyLoading() {
    // Native lazy loading is already in HTML, but we add preloading for adjacent images
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading supported - preload adjacent on hover
      document.querySelectorAll('.gallery-frame').forEach((frame, index) => {
        frame.addEventListener('mouseenter', () => {
          preloadAdjacent(index);
        });
      });
    } else {
      // Fallback for older browsers
      const images = document.querySelectorAll('.gallery-image[loading="lazy"]');
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            lazyObserver.unobserve(img);
          }
        });
      });

      images.forEach((img) => lazyObserver.observe(img));
    }
  }

  function preloadAdjacent(currentIndex) {
    const prevIndex = (currentIndex - 1 + state.images.length) % state.images.length;
    const nextIndex = (currentIndex + 1) % state.images.length;

    [prevIndex, nextIndex].forEach((idx) => {
      const imgData = state.images[idx];
      if (imgData && imgData.src) {
        const preloadImg = new Image();
        preloadImg.src = imgData.src;
      }
    });
  }

  // ==========================================================================
  // Touch/Swipe Support for Lightbox
  // ==========================================================================
  let touchStartX = 0;
  let touchEndX = 0;

  elements.lightbox?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  elements.lightbox?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    if (!state.lightboxOpen) return;

    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        showNext();
      } else {
        showPrevious();
      }
    }
  }

  // ==========================================================================
  // Start
  // ==========================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
