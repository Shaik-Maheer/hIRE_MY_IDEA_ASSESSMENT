(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '.olive-faq-answer{overflow:hidden;max-height:0;opacity:0;transition:max-height .32s ease,opacity .22s ease,padding-top .22s ease;padding-top:0;color:#4b6351;font-size:15px;line-height:1.65;}',
      '.olive-faq-item.open .olive-faq-answer{opacity:1;padding-top:.5rem;}',
      '.olive-faq-item button{cursor:pointer;}',
      '.olive-faq-item .olive-faq-icon{transition:transform .25s ease;}',
      '.olive-faq-item.open .olive-faq-icon{transform:rotate(45deg);}',
      '@keyframes oliveRowMove{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(-50%,0,0)}}',
      '@keyframes oliveHeroMove{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(-50%,0,0)}}'
    ].join('');
    document.head.appendChild(style);
  }

  function setupFaq() {
    var answers = {
      'What is the Food Scanner App and how does it work?':
        'Olive is a comprehensive tool designed to help busy parents make informed food choices. By scanning product barcodes, it quickly identifies harmful ingredients and suggests safer alternatives, ensuring that you always stay ahead of potential health risks.',
      'How does Olive ensure the accuracy of the Food Scanner App results?':
        'Olive combines expert nutrition guidance with continuously updated product data and ingredient analysis, so recommendations stay practical and reliable for everyday shopping.',
      'Which products can I scan with the Food Scanner App?':
        'You can scan most packaged grocery items with barcodes, and Olive will break down ingredient quality, additives, processing level, and overall product score.',
      'Can the Food Scanner App be customized to my family\'s dietary needs?':
        'Yes. Olive helps tailor recommendations for family preferences and dietary goals so you can filter choices and shop with more confidence.',
      'Is my data secure when I use the Olive?':
        'Olive is built with privacy in mind and protects your account and usage data so families can use the app safely.',
      'When will the Android version of the Food Scanner App be available?':
        'The Android version is in progress. Olive currently prioritizes iOS while expanding access for Android users.'
    };

    var faqTitle = Array.from(document.querySelectorAll('h2')).find(function (el) {
      return /Frequently Asked Questions by Parents/i.test(el.textContent || '');
    });
    if (!faqTitle) return;

    var faqSection = faqTitle.closest('section') || faqTitle.parentElement;
    if (!faqSection) return;

    var items = Array.from(faqSection.querySelectorAll('.space-y-2 > div'));
    if (!items.length) {
      items = Array.from(faqSection.querySelectorAll('button')).map(function (btn) {
        return btn.parentElement;
      }).filter(function (el) {
        return !!el;
      });
    }
    if (!items.length) return;

    function closeItem(item) {
      item.classList.remove('open');
      var panel = item.querySelector('.olive-faq-answer');
      if (!panel) return;
      panel.style.maxHeight = '0px';
      panel.setAttribute('aria-hidden', 'true');
    }

    function openItem(item) {
      item.classList.add('open');
      var panel = item.querySelector('.olive-faq-answer');
      if (!panel) return;
      panel.style.maxHeight = panel.scrollHeight + 'px';
      panel.setAttribute('aria-hidden', 'false');
    }

    items.forEach(function (item, index) {
      item.classList.add('olive-faq-item');
      var btn = item.querySelector('button');
      var h3 = item.querySelector('h3');
      if (!btn || !h3) return;
      btn.type = 'button';

      var icon = item.querySelector('svg');
      if (icon) icon.classList.add('olive-faq-icon');

      var q = (h3.textContent || '').trim();
      var panel = document.createElement('div');
      panel.className = 'olive-faq-answer';
      panel.textContent = answers[q] || 'Olive provides clear, expert-backed guidance to help families make safer and smarter food decisions.';
      panel.setAttribute('aria-hidden', 'true');
      item.appendChild(panel);

      if (index === 0) openItem(item);
    });

    if (!faqSection.dataset.oliveFaqBound) {
      faqSection.dataset.oliveFaqBound = '1';
      faqSection.addEventListener('click', function (ev) {
        var btn = ev.target && ev.target.closest ? ev.target.closest('.olive-faq-item button') : null;
        if (!btn) return;
        ev.preventDefault();
        ev.stopPropagation();
        var item = btn.closest('.olive-faq-item');
        if (!item) return;
        var alreadyOpen = item.classList.contains('open');
        items.forEach(closeItem);
        if (!alreadyOpen) openItem(item);
      });
    }
  }

  function animateTicker(inner, speed, reverse) {
    if (!inner || inner.dataset.oliveTickerReady) return;
    inner.dataset.oliveTickerReady = '1';

    var pos = reverse ? -(inner.scrollWidth / 2) : 0;
    var dir = reverse ? 1 : -1;
    var last = performance.now();

    function step(now) {
      var half = inner.scrollWidth / 2;
      var dt = (now - last) / 1000;
      last = now;
      pos += dir * speed * dt;

      if (dir < 0 && pos <= -half) pos = 0;
      if (dir > 0 && pos >= 0) pos = -half;

      inner.style.transform = 'translate3d(' + pos + 'px,0,0)';
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function setupMovingIngredientImage() {
    var heading = Array.from(document.querySelectorAll('h3')).find(function (el) {
      return /Proactive Ingredient Filtering/i.test(el.textContent || '');
    });
    if (!heading) return;

    var card = heading.closest('.p-4');
    if (!card) return;

    var movingPanel = card.querySelector('.bg-gradient-to-b');
    if (!movingPanel) return;

    var rows = Array.from(movingPanel.querySelectorAll('div')).filter(function (el) {
      return typeof el.className === 'string' && el.className.indexOf('relative w-full h-[40px]') !== -1;
    });

    rows.forEach(function (row, idx) {
      var track = row.firstElementChild;
      if (!track) return;

      if (!track.dataset.cloned) {
        track.innerHTML += track.innerHTML;
        track.dataset.cloned = '1';
      }

      track.classList.add('olive-motion-track');
      track.style.display = 'flex';
      track.style.width = 'max-content';
      track.style.willChange = 'transform';
      animateTicker(track, 22 + idx * 4, idx % 2 === 1);
    });
  }

  function setupHeroMovingStrip() {
    var tracks = Array.from(document.querySelectorAll('div')).filter(function (el) {
      if (typeof el.className !== 'string') return false;
      if (el.className.indexOf('absolute z-1 top-1/2') === -1) return false;
      if (el.className.indexOf('flex gap-2 items-center') === -1) return false;
      return !!el.querySelector('img[src*="product-"]');
    });

    tracks.forEach(function (track, idx) {
      if (track.dataset.heroReady) return;
      track.dataset.heroReady = '1';

      track.style.removeProperty('transform');

      var children = Array.from(track.children);
      if (!children.length) return;

      var inner = document.createElement('div');
      inner.className = 'olive-hero-track-inner';
      inner.style.display = 'flex';
      inner.style.alignItems = 'center';
      inner.style.gap = '0.5rem';
      inner.style.width = 'max-content';
      inner.style.willChange = 'transform';

      children.forEach(function (child) {
        inner.appendChild(child);
      });

      inner.innerHTML += inner.innerHTML;
      track.appendChild(inner);
      track.style.display = 'block';
      track.style.gap = '0';

      animateTicker(inner, 40 + idx * 6, idx % 2 === 1);
    });
  }

  function setupHeroPhoneDetails() {
    var detailPanels = Array.from(document.querySelectorAll('div')).filter(function (el) {
      if (typeof el.className !== 'string') return false;
      if (el.className.indexOf('absolute flex items-end z-100') === -1) return false;
      return !!el.querySelector('img[src*="product-5-details.png"]');
    });

    detailPanels.forEach(function (panel) {
      function forceShow() {
        panel.style.opacity = '1';
        panel.style.transform = 'translateY(0)';
        panel.style.transition = 'opacity .45s ease, transform .45s ease';
      }

      forceShow();
      if (!panel.dataset.oliveObserverBound && typeof MutationObserver !== 'undefined') {
        panel.dataset.oliveObserverBound = '1';
        var obs = new MutationObserver(forceShow);
        obs.observe(panel, { attributes: true, attributeFilter: ['style', 'class'] });
      }
    });
  }

  function safeRun(fn) {
    try {
      fn();
    } catch (err) {
      console.error('[olive-interactions] failed:', err);
    }
  }

  ready(function () {
    injectStyles();
    safeRun(setupFaq);
    safeRun(setupMovingIngredientImage);
    safeRun(setupHeroMovingStrip);
    safeRun(setupHeroPhoneDetails);
  });
})();
