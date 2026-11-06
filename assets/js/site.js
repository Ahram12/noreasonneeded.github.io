/* =========================================================
   No Reason Needed — progressive enhancements

   Everything here is optional: with JavaScript disabled the
   page still renders correctly, just without the theme
   toggle, the reading-progress bar and the margin table of
   contents.
   ========================================================= */

(function () {
    'use strict';

    var root = document.documentElement;


    /* ---- Theme toggle ----------------------------------
       The saved theme is applied by an inline script in
       <head>; this only handles switching it afterwards.
       -------------------------------------------------- */

    function prefersDark() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function currentTheme() {
        return root.getAttribute('data-theme') || (prefersDark() ? 'dark' : 'light');
    }

    var toggle = document.querySelector('[data-theme-toggle]');

    if (toggle) {
        toggle.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try {
                localStorage.setItem('theme', next);
            } catch (e) {}
        });
    }


    /* ---- Header hairline on scroll --------------------- */

    var header = document.querySelector('[data-site-header]');


    /* ---- Reading progress ------------------------------ */

    var bar = document.querySelector('[data-progress-bar]');
    var article = document.querySelector('.post-content');

    function updateProgress() {
        if (!bar) {
            return;
        }

        if (!article) {
            bar.style.width = '0%';
            return;
        }

        var start = article.offsetTop;
        var span = article.offsetHeight - window.innerHeight;
        var read = window.scrollY - start;
        var pct = span > 0 ? (read / span) * 100 : 0;

        bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }


    /* ---- Table of contents -----------------------------
       kramdown emits ul#markdown-toc inline, preceded by a
       "Contents" heading. Both are moved into the <aside>
       so wide screens can show them in the left margin.
       -------------------------------------------------- */

    var toc = document.getElementById('markdown-toc');
    var tocHost = document.querySelector('[data-toc]');
    var tocLinks = [];
    var targets = [];

    if (toc && tocHost) {
        var heading = toc.previousElementSibling;

        if (heading && /^h[1-6]$/i.test(heading.tagName) &&
            heading.textContent.trim().toLowerCase() === 'contents') {
            heading.classList.add('toc-hidden');
        }

        var label = document.createElement('p');
        label.className = 'post-toc__label';
        label.textContent = 'Contents';

        tocHost.appendChild(label);
        tocHost.appendChild(toc);
    }

    if (toc) {
        tocLinks = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));

        targets = tocLinks.map(function (link) {
            return document.getElementById(decodeURIComponent(link.getAttribute('href').slice(1)));
        });
    }

    var activeLink = null;

    function updateScrollspy() {
        if (!tocLinks.length) {
            return;
        }

        var offset = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
        var mark = window.scrollY + offset + 8;
        var found = null;

        for (var i = 0; i < targets.length; i++) {
            if (targets[i] && targets[i].offsetTop <= mark) {
                found = tocLinks[i];
            }
        }

        /* Before the first heading, highlight nothing; at the
           very bottom, highlight the last entry. */
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) {
            found = tocLinks[tocLinks.length - 1];
        }

        if (found !== activeLink) {
            if (activeLink) {
                activeLink.classList.remove('is-active');
            }
            if (found) {
                found.classList.add('is-active');
            }
            activeLink = found;
        }
    }


    /* ---- One throttled scroll listener for all of it ---- */

    var ticking = false;

    function onScroll() {
        if (ticking) {
            return;
        }

        ticking = true;

        window.requestAnimationFrame(function () {
            if (header) {
                header.setAttribute('data-scrolled', window.scrollY > 4 ? 'true' : 'false');
            }

            updateProgress();
            updateScrollspy();

            ticking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    onScroll();

    /* MathJax changes the page height once it finishes typesetting. */
    window.addEventListener('load', onScroll);
}());
