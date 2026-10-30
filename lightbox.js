/**
 * LIGHTBOX & FULLSCREEN MODAL PREMIUM · PORTAFOLIO RED UDES
 * Visualizador interactivo de alta definición con zoom 1:1, navegación táctil y pantalla completa
 */
(() => {
  // SVG Icons
  const ICONS = {
    fullscreen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>',
    exitFullscreen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>',
    zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
    zoomOut: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
  };

  let galleryItems = [];
  let currentIndex = 0;
  let isZoomed = false;

  // 1. Build and inject Lightbox DOM
  function createModal() {
    if (document.getElementById('udes-lightbox-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'udes-lightbox-modal';
    modal.className = 'lightbox-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Visualizador de imagen en pantalla completa');

    modal.innerHTML = `
      <header class="lightbox-topbar">
        <div class="lightbox-title-area">
          <span class="lightbox-badge">UDES · ALTA DEFINICIÓN</span>
          <span class="lightbox-counter" id="lightbox-counter">1 / 1</span>
        </div>
        <div class="lightbox-actions">
          <button type="button" class="lightbox-btn" id="lightbox-btn-zoom" title="Alternar tamaño real (100% zoom)">
            ${ICONS.zoomIn}
            <span>Zoom 1:1</span>
          </button>
          <button type="button" class="lightbox-btn" id="lightbox-btn-fs" title="Pantalla completa nativa (F11)">
            ${ICONS.fullscreen}
            <span>Pantalla Completa</span>
          </button>
          <a class="lightbox-btn" id="lightbox-btn-download" href="#" target="_blank" download title="Abrir / Descargar imagen original">
            ${ICONS.download}
            <span>Original</span>
          </a>
          <button type="button" class="lightbox-btn lightbox-btn-close" id="lightbox-btn-close" title="Cerrar (Esc)">
            ${ICONS.close}
            <span>Cerrar</span>
          </button>
        </div>
      </header>

      <div class="lightbox-body" id="lightbox-body">
        <button type="button" class="lightbox-nav-btn lightbox-nav-prev" id="lightbox-nav-prev" aria-label="Imagen anterior">‹</button>
        <div class="lightbox-img-wrapper" id="lightbox-wrapper">
          <img class="lightbox-img" id="lightbox-img" src="" alt="">
        </div>
        <button type="button" class="lightbox-nav-btn lightbox-nav-next" id="lightbox-nav-next" aria-label="Imagen siguiente">›</button>
      </div>

      <footer class="lightbox-bottombar">
        <div class="lightbox-caption" id="lightbox-caption">Título de la imagen</div>
        <div class="lightbox-shortcuts">
          <span><kbd>Esc</kbd> Cerrar</span>
          <span><kbd>←</kbd> <kbd>→</kbd> Navegar</span>
          <span><kbd>F</kbd> Pantalla completa</span>
          <span><kbd>Z</kbd> Zoom 1:1</span>
        </div>
      </footer>
    `;

    document.body.appendChild(modal);

    // Event listeners for modal controls
    document.getElementById('lightbox-btn-close').addEventListener('click', closeModal);
    document.getElementById('lightbox-nav-prev').addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
    document.getElementById('lightbox-nav-next').addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
    document.getElementById('lightbox-btn-zoom').addEventListener('click', toggleZoom);
    document.getElementById('lightbox-btn-fs').addEventListener('click', toggleFullscreen);

    // Click outside to close (if not clicking image, buttons or controls)
    document.getElementById('lightbox-body').addEventListener('click', (e) => {
      if (e.target.id === 'lightbox-body' || e.target.id === 'lightbox-wrapper') {
        closeModal();
      }
    });

    // Double click image to toggle zoom
    document.getElementById('lightbox-img').addEventListener('dblclick', toggleZoom);

    // Keyboard support
    window.addEventListener('keydown', handleKeydown);

    // Handle Fullscreen change event from browser
    document.addEventListener('fullscreenchange', updateFsButton);
    document.addEventListener('webkitfullscreenchange', updateFsButton);
  }

  // 2. Scan and register gallery items
  function initGallery() {
    galleryItems = [];
    // Select figures in presentation slide decks
    const figures = document.querySelectorAll(
      '.deck-slide figure, .deck-visual figure, .deck-figure, .deck-side-figure, .slide-split figure, .slide-card figure'
    );

    figures.forEach((fig) => {
      const img = fig.querySelector('img');
      if (!img) return;

      const figcaption = fig.querySelector('figcaption');
      const captionText = figcaption ? figcaption.textContent.trim() : (img.getAttribute('alt') || 'Imagen del modelo de evaluación RED');
      const src = img.getAttribute('src');

      const index = galleryItems.length;
      galleryItems.push({
        src: src,
        alt: img.getAttribute('alt') || captionText,
        caption: captionText,
        originalImg: img
      });

      // Inject hover button if not already present
      if (!fig.querySelector('.zoom-trigger-btn')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'zoom-trigger-btn';
        btn.innerHTML = `${ICONS.fullscreen}<span>Pantalla completa</span>`;
        btn.setAttribute('aria-label', `Ampliar imagen: ${captionText}`);
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          openModal(index);
        });
        fig.appendChild(btn);
      }

      // Clicking anywhere on the figure or image opens the lightbox
      fig.style.cursor = 'zoom-in';
      fig.addEventListener('click', (e) => {
        // Prevent opening if clicking an interactive link inside figcaption
        if (e.target.tagName === 'A') return;
        openModal(index);
      });
    });
  }

  // 3. Open Modal
  function openModal(index) {
    if (galleryItems.length === 0) return;
    createModal();

    currentIndex = (index + galleryItems.length) % galleryItems.length;
    isZoomed = false;
    document.getElementById('udes-lightbox-modal').classList.remove('is-zoomed');

    updateModalContent();

    const modal = document.getElementById('udes-lightbox-modal');
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  }

  // 4. Update image & details
  function updateModalContent() {
    const item = galleryItems[currentIndex];
    if (!item) return;

    const img = document.getElementById('lightbox-img');
    const counter = document.getElementById('lightbox-counter');
    const caption = document.getElementById('lightbox-caption');
    const download = document.getElementById('lightbox-btn-download');

    img.src = item.src;
    img.alt = item.alt;
    counter.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
    caption.textContent = item.caption;
    download.href = item.src;

    // Reset zoom state when navigating
    if (isZoomed) {
      isZoomed = false;
      document.getElementById('udes-lightbox-modal').classList.remove('is-zoomed');
      document.getElementById('lightbox-btn-zoom').innerHTML = `${ICONS.zoomIn}<span>Zoom 1:1</span>`;
    }
  }

  // 5. Navigate
  function showPrev() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    updateModalContent();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    updateModalContent();
  }

  // 6. Toggle Zoom 1:1
  function toggleZoom() {
    const modal = document.getElementById('udes-lightbox-modal');
    const btn = document.getElementById('lightbox-btn-zoom');
    isZoomed = !isZoomed;

    if (isZoomed) {
      modal.classList.add('is-zoomed');
      btn.innerHTML = `${ICONS.zoomOut}<span>Ajustar</span>`;
    } else {
      modal.classList.remove('is-zoomed');
      btn.innerHTML = `${ICONS.zoomIn}<span>Zoom 1:1</span>`;
    }
  }

  // 7. Toggle Browser Fullscreen
  function toggleFullscreen() {
    const modal = document.getElementById('udes-lightbox-modal');
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (modal.requestFullscreen) {
        modal.requestFullscreen();
      } else if (modal.webkitRequestFullscreen) {
        modal.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  function updateFsButton() {
    const btn = document.getElementById('lightbox-btn-fs');
    if (!btn) return;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      btn.innerHTML = `${ICONS.exitFullscreen}<span>Salir pantalla</span>`;
    } else {
      btn.innerHTML = `${ICONS.fullscreen}<span>Pantalla Completa</span>`;
    }
  }

  // 8. Close Modal
  function closeModal() {
    const modal = document.getElementById('udes-lightbox-modal');
    if (!modal || !modal.classList.contains('is-active')) return;

    modal.classList.remove('is-active');
    document.body.style.overflow = ''; // Restore background scroll

    // Exit fullscreen if active
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  // 9. Keyboard shortcuts handler
  function handleKeydown(e) {
    const modal = document.getElementById('udes-lightbox-modal');
    if (!modal || !modal.classList.contains('is-active')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      showPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      showNext();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      toggleZoom();
    }
  }

  // Touch Swipe Support for Mobile
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener('touchstart', (e) => {
    const modal = document.getElementById('udes-lightbox-modal');
    if (!modal || !modal.classList.contains('is-active')) return;
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const modal = document.getElementById('udes-lightbox-modal');
    if (!modal || !modal.classList.contains('is-active') || isZoomed) return;
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) {
      showNext();
    } else if (touchEndX > touchStartX + 50) {
      showPrev();
    }
  }, { passive: true });

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
  } else {
    initGallery();
  }
})();
