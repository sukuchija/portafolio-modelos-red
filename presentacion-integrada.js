(()=>{
  const deck = document.querySelector('[data-deck]');
  if (!deck) return;

  const slides = [...deck.querySelectorAll('.deck-slide')];
  const prev = deck.querySelector('[data-prev]');
  const next = deck.querySelector('[data-next]');
  const counter = deck.querySelector('[data-counter]');
  const bar = deck.querySelector('[data-progress]');
  const stage = deck.querySelector('.deck-stage');
  let index = 0;

  function show(n) {
    index = Math.min(Math.max(n, 0), slides.length - 1);
    
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.removeAttribute('hidden');
        slide.classList.remove('is-hidden');
        slide.classList.add('is-active');
        slide.style.removeProperty('display');
        slide.scrollTop = 0;
      } else {
        slide.setAttribute('hidden', '');
        slide.classList.add('is-hidden');
        slide.classList.remove('is-active');
        slide.style.setProperty('display', 'none', 'important');
      }
    });

    if (stage) stage.scrollTop = 0;

    if (prev) prev.disabled = (index === 0);
    if (next) next.disabled = (index === slides.length - 1);
    
    if (counter) {
      counter.textContent = `${index + 1} / ${slides.length}`;
      counter.setAttribute('aria-label', `Diapositiva ${index + 1} de ${slides.length}`);
    }
    
    if (bar) {
      bar.style.width = `${(100 * (index + 1)) / slides.length}%`;
    }
  }

  if (prev) prev.addEventListener('click', () => show(index - 1));
  if (next) next.addEventListener('click', () => show(index + 1));

  deck.addEventListener('keydown', (e) => {
    // Only handle arrows if lightbox modal is not currently open
    const modal = document.getElementById('udes-lightbox-modal');
    if (modal && modal.classList.contains('is-active')) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      show(index + 1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      show(index - 1);
    }
  });

  deck.classList.add('js-ready');
  show(0);
})();
