// Lightbox for portfolio screenshots.
// Click (or press Enter/Space) on a thumbnail to open it full size.
// Arrows, on-screen buttons and horizontal swipes move within the same gallery.
(function () {
    'use strict';

    const galleries = document.querySelectorAll('div.scroll-container');
    if (!galleries.length || !window.HTMLDialogElement) return;

    // Build the dialog once and append it to the page
    const dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.innerHTML = `
        <button type="button" class="lightbox__btn lightbox__close" aria-label="Close">&times;</button>
        <button type="button" class="lightbox__btn lightbox__prev" aria-label="Previous image">&#8249;</button>
        <figure class="lightbox__figure">
            <img class="lightbox__img" alt="" decoding="async">
            <figcaption class="lightbox__caption"></figcaption>
        </figure>
        <button type="button" class="lightbox__btn lightbox__next" aria-label="Next image">&#8250;</button>
    `;
    document.body.appendChild(dialog);

    const img = dialog.querySelector('.lightbox__img');
    const caption = dialog.querySelector('.lightbox__caption');
    const prevBtn = dialog.querySelector('.lightbox__prev');
    const nextBtn = dialog.querySelector('.lightbox__next');

    let items = [];          // thumbnails of the gallery that is currently open
    let index = 0;
    let opener = null;       // thumbnail that opened the lightbox, focus returns to it
    let touchStartX = null;

    // Show the image at position i, wrapping around at both ends
    function show(i) {
        index = (i + items.length) % items.length;
        const source = items[index];
        img.src = source.currentSrc || source.src;
        img.alt = source.alt;
        caption.textContent = source.alt
            ? `${source.alt} · ${index + 1} / ${items.length}`
            : `${index + 1} / ${items.length}`;
        prevBtn.hidden = nextBtn.hidden = items.length < 2;
    }

    function open(thumb) {
        items = Array.from(thumb.closest('div.scroll-container').querySelectorAll('img'));
        opener = thumb;
        show(items.indexOf(thumb));
        dialog.showModal();
    }

    // Make thumbnails keyboard-operable; without JS they stay plain images
    galleries.forEach(gallery => {
        gallery.querySelectorAll('img').forEach(thumb => {
            thumb.tabIndex = 0;
            thumb.setAttribute('role', 'button');
            thumb.addEventListener('click', () => open(thumb));
            thumb.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    open(thumb);
                }
            });
        });
    });

    dialog.querySelector('.lightbox__close').addEventListener('click', () => dialog.close());
    prevBtn.addEventListener('click', () => show(index - 1));
    nextBtn.addEventListener('click', () => show(index + 1));

    // Clicking the empty area around the image closes the lightbox
    dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') show(index - 1);
        if (event.key === 'ArrowRight') show(index + 1);
    });

    dialog.addEventListener('touchstart', event => {
        touchStartX = event.touches[0].clientX;
    }, { passive: true });

    dialog.addEventListener('touchend', event => {
        if (touchStartX === null) return;
        const dx = event.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
    });

    // Return focus to the thumbnail after closing (Escape closes natively)
    dialog.addEventListener('close', () => opener?.focus());
})();
