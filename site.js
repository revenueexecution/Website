(() => {
  const GA_ID = 'G-G8FVJ05VFQ';
  const CONSENT_KEY = 're_analytics_consent_v1';
  let gaLoaded = false;

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (_) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (_) {}
  }

  function clearAnalyticsCookies() {
    const host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (!name.startsWith('_ga')) return;
      document.cookie = `${name}=; Max-Age=0; path=/`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${host}`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${host}`;
    });
  }

  function trackPageContext() {
    if (typeof window.gtag !== 'function') return;
    const path = location.pathname;

    if (path.includes('/resources/articles/')) {
      window.gtag('event', 'article_view', {
        article_path: path,
        page_title: document.title
      });
    } else if (path === '/resources/' || path.endsWith('/resources/index.html')) {
      window.gtag('event', 'resource_view', {
        page_title: document.title
      });
    }
  }

  function loadGoogleAnalytics() {
    if (gaLoaded || getConsent() !== 'granted') return;
    gaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.onload = trackPageContext;
    document.head.appendChild(script);
  }

  function injectConsentStyles() {
    if (document.getElementById('re-consent-styles')) return;
    const style = document.createElement('style');
    style.id = 're-consent-styles';
    style.textContent = `
      #re-consent-banner{position:fixed;left:20px;right:20px;bottom:20px;z-index:9999;max-width:980px;margin:auto;background:#10252b;color:#fff;border-radius:18px;padding:20px 22px;box-shadow:0 18px 50px rgba(16,37,43,.28);font-family:Inter,system-ui,sans-serif}
      #re-consent-banner .re-consent-inner{display:flex;align-items:center;justify-content:space-between;gap:24px}
      #re-consent-banner p{margin:0;color:#d7e1e2;font-size:14px;line-height:1.5;max-width:680px}
      #re-consent-banner a{color:#fff;text-decoration:underline}
      #re-consent-banner .re-consent-actions{display:flex;gap:10px;flex-wrap:wrap}
      #re-consent-banner button{border:1px solid #fff;border-radius:999px;padding:10px 15px;font:inherit;font-weight:750;cursor:pointer}
      #re-consent-accept{background:#fff;color:#10252b}
      #re-consent-decline{background:transparent;color:#fff}
      .re-cookie-settings{background:none;border:0;padding:0;margin:0;color:inherit;text-decoration:underline;font:inherit;font-size:inherit;cursor:pointer}
      @media(max-width:720px){#re-consent-banner .re-consent-inner{align-items:flex-start;flex-direction:column}#re-consent-banner{left:12px;right:12px;bottom:12px}}
    `;
    document.head.appendChild(style);
  }

  function showConsentBanner(force = false) {
    if (!force && getConsent()) return;
    document.getElementById('re-consent-banner')?.remove();

    const previousConsent = getConsent();
    const banner = document.createElement('div');
    banner.id = 're-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Analytics preferences');
    banner.innerHTML = `
      <div class="re-consent-inner">
        <p>Revenue Execution uses Google Analytics to understand which pages and resources are useful. Analytics is only enabled if you accept. <a href="/privacy.html">Privacy policy</a>.</p>
        <div class="re-consent-actions">
          <button id="re-consent-decline" type="button">No thanks</button>
          <button id="re-consent-accept" type="button">Accept analytics</button>
        </div>
      </div>`;

    document.body.appendChild(banner);

    document.getElementById('re-consent-accept').addEventListener('click', () => {
      setConsent('granted');
      banner.remove();
      loadGoogleAnalytics();
    });

    document.getElementById('re-consent-decline').addEventListener('click', () => {
      setConsent('denied');
      clearAnalyticsCookies();
      banner.remove();
      if (previousConsent === 'granted') location.reload();
    });
  }

  function addCookieSettingsControl() {
    const footer = document.querySelector('footer');
    if (!footer || footer.querySelector('.re-cookie-settings')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 're-cookie-settings';
    button.textContent = 'Analytics settings';
    button.addEventListener('click', () => showConsentBanner(true));
    footer.appendChild(document.createTextNode(' · '));
    footer.appendChild(button);
  }

  function trackClick(event) {
    const link = event.target.closest('a');
    if (!link || typeof window.gtag !== 'function' || getConsent() !== 'granted') return;

    const href = link.getAttribute('href') || '';
    const fullHref = link.href || href;

    if (fullHref.includes('calendar.app.google/')) {
      window.gtag('event', 'book_call_click', {
        link_url: fullHref,
        page_path: location.pathname
      });
    }

    if (href.includes('#diagnostic') || href.includes('diagnostic.html')) {
      window.gtag('event', 'diagnostic_click', {
        link_url: fullHref,
        page_path: location.pathname
      });
    }

    if (href.includes('/articles/') || href.includes('./articles/')) {
      window.gtag('event', 'resource_click', {
        link_url: fullHref,
        page_path: location.pathname
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const year = new Date().getFullYear();
    document.querySelectorAll('[data-year]').forEach(el => el.textContent = year);

    const buttons = [...document.querySelectorAll('[data-solution-target]')];
    const flows = [...document.querySelectorAll('.solution-flow')];

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        flows.forEach(f => f.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.dataset.solutionTarget);
        if (target) target.classList.add('active');
      });
    });

    injectConsentStyles();
    addCookieSettingsControl();
    document.addEventListener('click', trackClick, true);

    const consent = getConsent();
    if (consent === 'granted') loadGoogleAnalytics();
    else if (!consent) showConsentBanner();
  });
})();
