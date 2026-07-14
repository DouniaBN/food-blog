/**
 * Recipe Reviews — Firebase Firestore (Spark plan, client SDK only)
 *
 * Lazy-loads the Firebase SDK (Firestore Lite, ~5x smaller than full
 * Firestore) only when the review section scrolls into view, so it has
 * zero impact on LCP / Core Web Vitals.
 *
 * Collections:
 *   reviews — PUBLIC: recipeSlug, rating (1-5), comment, name, timestamp
 *             Only the rating is required — name and comment may be empty
 *             strings (stars-only ratings count toward the average but
 *             don't appear in the written-reviews list).
 *
 * The average rating + count are computed client-side from the fetched
 * reviews (no Cloud Functions), and injected into the Recipe JSON-LD
 * once there is at least 1 review.
 */
(function () {
    'use strict';

    // Web app config from Firebase console (Project settings → Your apps).
    // The apiKey is a public client identifier, not a secret — safe in
    // client code; access control is enforced by firestore.rules.
    // window.YWG_FIREBASE_CONFIG (if set before this script) overrides this.
    const FIREBASE_CONFIG = window.YWG_FIREBASE_CONFIG || {
        apiKey: 'AIzaSyBTe4QkEWKk_G5k28fqV7sLXfXPrDqWTr0',
        authDomain: 'yourwellnessgirly-4c224.firebaseapp.com',
        projectId: 'yourwellnessgirly-4c224',
        appId: '1:1058327862319:web:b41a8335a6d5b6e2557ada'
    };

    const SDK_BASE = 'https://www.gstatic.com/firebasejs/12.16.0/';
    const PAGE_SIZE = 10;

    const state = {
        db: null,
        firestore: null, // the imported firestore-lite module
        slug: null,
        reviews: [],     // { rating, name, comment, date: Date }
        shown: PAGE_SIZE,
        rating: 0,       // currently selected star in the form
        loaded: false
    };

    const els = {};

    document.addEventListener('DOMContentLoaded', init);
    if (document.readyState !== 'loading') init();

    function init() {
        const section = document.querySelector('[data-reviews-slug]');
        if (!section || section.dataset.reviewsInit) return;
        section.dataset.reviewsInit = '1';

        if (JSON.stringify(FIREBASE_CONFIG).indexOf('PASTE_') !== -1) {
            section.hidden = true;
            console.warn('[reviews] Firebase config not set — review section hidden.');
            return;
        }

        els.section = section;
        state.slug = section.dataset.reviewsSlug;
        els.summary = section.querySelector('.reviews-summary');
        els.summaryStars = section.querySelector('.reviews-summary-stars');
        els.summaryText = section.querySelector('.reviews-summary-text');
        els.emptySummary = section.querySelector('.reviews-empty-summary');
        els.form = section.querySelector('.review-form');
        els.starsInput = section.querySelector('.review-stars-input');
        els.error = section.querySelector('.review-error');
        els.success = section.querySelector('.review-success');
        els.emptyList = section.querySelector('.reviews-empty-list');
        els.list = section.querySelector('.reviews-list');
        els.loadMore = section.querySelector('.reviews-load-more');

        bindForm();

        // Lazy-load Firebase only when the section approaches the viewport
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver(function (entries) {
                if (entries.some(function (e) { return e.isIntersecting; })) {
                    io.disconnect();
                    loadReviews();
                }
            }, { rootMargin: '600px' });
            io.observe(section);
        } else {
            loadReviews();
        }
    }

    // ---------- Firebase ----------

    async function ensureFirebase() {
        if (state.db) return;
        const [app, firestore] = await Promise.all([
            import(SDK_BASE + 'firebase-app.js'),
            import(SDK_BASE + 'firebase-firestore-lite.js')
        ]);
        state.firestore = firestore;
        state.db = firestore.getFirestore(app.initializeApp(FIREBASE_CONFIG));
    }

    async function loadReviews() {
        try {
            await ensureFirebase();
            const fs = state.firestore;
            // Equality filter only (no orderBy) — avoids needing a composite
            // index; sorting happens client-side since we need every rating
            // for the average anyway.
            const snap = await fs.getDocs(fs.query(
                fs.collection(state.db, 'reviews'),
                fs.where('recipeSlug', '==', state.slug)
            ));
            state.reviews = snap.docs.map(function (doc) {
                const d = doc.data();
                return {
                    rating: Number(d.rating) || 0,
                    name: String(d.name || 'Anonymous'),
                    comment: String(d.comment || ''),
                    date: d.timestamp && d.timestamp.toDate ? d.timestamp.toDate() : null
                };
            }).sort(function (a, b) {
                return (b.date ? b.date.getTime() : 0) - (a.date ? a.date.getTime() : 0);
            });
            state.loaded = true;
            renderAll();
        } catch (err) {
            console.warn('[reviews] Could not load reviews:', err);
            els.emptyList.hidden = false;
            els.emptyList.textContent = 'Reviews couldn’t load right now — check back soon!';
        }
    }

    // ---------- Rendering ----------

    function renderAll() {
        renderSummary();
        renderList();
        updateJsonLd();
    }

    function average() {
        if (!state.reviews.length) return 0;
        const sum = state.reviews.reduce(function (t, r) { return t + r.rating; }, 0);
        return sum / state.reviews.length;
    }

    function renderSummary() {
        const count = state.reviews.length;
        if (!count) {
            els.summary.hidden = true;
            els.emptySummary.hidden = false;
            return;
        }
        const avg = average();
        els.emptySummary.hidden = true;
        els.summary.hidden = false;
        els.summaryStars.innerHTML = starIcons(avg);
        els.summaryText.textContent = avg.toFixed(1) + ' from ' +
            count + (count === 1 ? ' rating' : ' ratings');
    }

    // Static icon markup only — never used with user-supplied strings
    function starIcons(value) {
        const rounded = Math.round(value * 2) / 2;
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (rounded >= i) html += '<i class="fas fa-star"></i>';
            else if (rounded >= i - 0.5) html += '<i class="fas fa-star-half-alt"></i>';
            else html += '<i class="far fa-star"></i>';
        }
        return html;
    }

    function renderList() {
        // Stars-only ratings (no comment) count toward the average but
        // aren't rendered as empty rows in the written-reviews list.
        const commented = state.reviews.filter(function (r) { return r.comment; });
        els.emptyList.hidden = commented.length > 0;
        if (!commented.length) els.emptyList.textContent = 'No written reviews yet — be the first!';
        els.list.textContent = '';

        commented.slice(0, state.shown).forEach(function (r) {
            const item = document.createElement('article');
            item.className = 'review-item';

            const head = document.createElement('div');
            head.className = 'review-item-head';

            const stars = document.createElement('span');
            stars.className = 'review-item-stars';
            stars.setAttribute('aria-label', r.rating + ' out of 5 stars');
            stars.innerHTML = starIcons(r.rating);

            const name = document.createElement('span');
            name.className = 'review-item-name';
            name.textContent = r.name; // textContent = XSS-safe

            const date = document.createElement('span');
            date.className = 'review-item-date';
            date.textContent = r.date
                ? r.date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                : '';

            head.appendChild(stars);
            head.appendChild(name);
            head.appendChild(date);

            const comment = document.createElement('p');
            comment.className = 'review-item-comment';
            comment.textContent = r.comment; // textContent = XSS-safe

            item.appendChild(head);
            item.appendChild(comment);
            els.list.appendChild(item);
        });

        els.loadMore.hidden = commented.length <= state.shown;
    }

    /**
     * Injects aggregateRating into the existing Recipe JSON-LD from the
     * first review onward. Pages have multiple ld+json tags (Recipe,
     * Breadcrumb, FAQ) — only the one with "@type": "Recipe" is touched.
     */
    function updateJsonLd() {
        const count = state.reviews.length;
        if (count < 1) return;
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (let i = 0; i < scripts.length; i++) {
            let data;
            try { data = JSON.parse(scripts[i].textContent); } catch (e) { continue; }
            if (!data || data['@type'] !== 'Recipe') continue;
            data.aggregateRating = {
                '@type': 'AggregateRating',
                'ratingValue': average().toFixed(1),
                'ratingCount': String(count)
            };
            scripts[i].textContent = JSON.stringify(data, null, 2);
            return;
        }
    }

    // ---------- Form ----------

    function bindForm() {
        const starButtons = Array.prototype.slice.call(
            els.starsInput.querySelectorAll('button'));

        function paintStars(upTo) {
            starButtons.forEach(function (btn) {
                const v = Number(btn.dataset.value);
                btn.querySelector('i').className = v <= upTo ? 'fas fa-star' : 'far fa-star';
                btn.setAttribute('aria-checked', v === state.rating ? 'true' : 'false');
            });
        }

        starButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                state.rating = Number(btn.dataset.value);
                paintStars(state.rating);
            });
            btn.addEventListener('mouseenter', function () {
                paintStars(Number(btn.dataset.value));
            });
        });
        els.starsInput.addEventListener('mouseleave', function () {
            paintStars(state.rating);
        });

        els.form.addEventListener('submit', onSubmit);
    }

    function showError(msg) {
        els.error.textContent = msg;
        els.error.hidden = false;
    }

    async function onSubmit(e) {
        e.preventDefault();
        els.error.hidden = true;

        const form = els.form;
        const name = form.elements.name.value.trim();
        const comment = form.elements.comment.value.trim();
        const honeypot = form.elements.website.value;

        if (!state.rating) return showError('Please pick a star rating.');
        if (name && name.length < 2) return showError('Names need at least 2 characters — or leave it blank.');
        if (name.length > 60) return showError('Name is too long (60 characters max).');
        if (comment && comment.length < 10) return showError('Reviews need at least 10 characters — or leave it blank for a stars-only rating.');
        if (comment.length > 2000) return showError('Review is too long (2000 characters max).');

        // Honeypot filled = bot. Pretend success, write nothing.
        if (honeypot) return submitSuccess({ rating: state.rating, name: name || 'Anonymous', comment: comment, date: new Date() }, true);

        const submitBtn = form.querySelector('.review-submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Posting…';

        try {
            await ensureFirebase();
            const fs = state.firestore;

            await fs.addDoc(fs.collection(state.db, 'reviews'), {
                recipeSlug: state.slug,
                rating: state.rating,
                name: name,
                comment: comment,
                timestamp: fs.serverTimestamp()
            });

            submitSuccess({ rating: state.rating, name: name || 'Anonymous', comment: comment, date: new Date() }, false);
        } catch (err) {
            console.warn('[reviews] Submit failed:', err);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Post review';
            showError('Something went wrong posting your review — please try again.');
        }
    }

    function submitSuccess(review, isBot) {
        els.form.hidden = true;
        els.success.hidden = false;
        if (isBot) return;
        if (state.loaded) {
            state.reviews.unshift(review);
            renderAll();
        } else {
            // Section was submitted before/without the initial fetch finishing
            loadReviews();
        }
    }
})();
