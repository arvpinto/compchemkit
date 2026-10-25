/* CompChemKit guide: contents list, section highlighting and screenshot viewer.
   Works on the HTML that GitHub Pages renders from README.md. */
(function () {
  'use strict';

  var prose = document.querySelector('.prose');
  if (!prose) return;

  /* ---- README.md uses <br> lines as spacers (for GitHub); here they only
     add gaps, so paragraphs holding nothing but a line break are removed. */
  Array.prototype.forEach.call(prose.querySelectorAll('p'), function (p) {
    if (p.textContent.trim() === '' && p.children.length && Array.prototype.every.call(p.children, function (c) { return c.tagName === 'BR'; })) {
      p.parentNode.removeChild(p);
    }
  });

  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  /* ---- Headings: "I - Installation" becomes a numbered heading with an id. */
  var toc = document.getElementById('toc');
  var headings = Array.prototype.slice.call(prose.querySelectorAll('h2'));
  var links = [];

  headings.forEach(function (h) {
    var text = h.textContent.replace(/\s+/g, ' ').trim();
    var m = text.match(/^([IVXLC]+)\s*[-–—]\s*(.+)$/);
    var num = m ? m[1] : '';
    var title = m ? m[2] : text;
    if (!h.id) h.id = slug(title);

    h.textContent = '';
    if (num) {
      var n = document.createElement('span');
      n.className = 'n';
      n.textContent = num;
      h.appendChild(n);
    }
    h.appendChild(document.createTextNode(title));

    if (toc) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      if (num) {
        var tn = document.createElement('span');
        tn.className = 'n';
        tn.textContent = num;
        a.appendChild(tn);
      }
      a.appendChild(document.createTextNode(title));
      li.appendChild(a);
      toc.appendChild(li);
      links.push(a);
    }
  });

  /* ---- Highlight the section being read. */
  if (links.length && 'IntersectionObserver' in window) {
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) current = e.target.id;
      });
      links.forEach(function (a) {
        a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + current));
      });
    }, { rootMargin: '-80px 0px -70% 0px' });
    headings.forEach(function (h) { io.observe(h); });
  }

  /* ---- Screenshots: captioned figures that open larger on click. */
  var dialog = document.getElementById('lightbox');
  var big = dialog && dialog.querySelector('img');
  var cap = dialog && dialog.querySelector('.lightbox-caption');

  function open(img) {
    if (!dialog || typeof dialog.showModal !== 'function') {
      window.open(img.currentSrc || img.src, '_blank', 'noopener');
      return;
    }
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    cap.textContent = img.alt;
    dialog.showModal();
  }

  Array.prototype.forEach.call(prose.querySelectorAll('div[align="center"] > img'), function (img) {
    var fig = document.createElement('figure');
    fig.className = 'shot';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Enlarge: ' + img.alt);
    img.parentNode.insertBefore(fig, img);
    btn.appendChild(img);
    fig.appendChild(btn);
    if (img.alt) {
      var fc = document.createElement('figcaption');
      fc.textContent = img.alt;
      fig.appendChild(fc);
    }
    btn.addEventListener('click', function () { open(img); });
  });

  if (dialog) {
    dialog.querySelector('.lightbox-close').addEventListener('click', function () { dialog.close(); });
    // A click on the dimmed backdrop closes the viewer.
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  }
})();
