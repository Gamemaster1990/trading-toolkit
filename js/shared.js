/* ===========================
   Trading Toolkit - Shared Functions
   Extracted for use on non-calculator pages
   (Theme, Mobile Drawer, Toast, Cookie Consent)
   =========================== */

// ===========================
// Toast Notification System
// ===========================

function showToast(message, type) {
  if (type === undefined) type = 'info';
  var container = document.getElementById('toast-container');
  if (!container) return;
  
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  var icons = { success: '\u2713', error: '\u2715', info: '\u25CF' };
  toast.innerHTML = '<span>' + (icons[type] || '\u25CF') + '</span> ' + message;
  container.appendChild(toast);
  
  setTimeout(function() {
    toast.classList.add('removing');
    setTimeout(function() { toast.remove(); }, 250);
  }, 3000);
}

// ===========================
// Mobile Drawer Navigation
// ===========================

function toggleMobileMenu() {
  var drawer = document.getElementById('mobileDrawer');
  var overlay = document.getElementById('drawerOverlay');
  drawer.classList.toggle('open');
  overlay.classList.toggle('active');
  document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
}

function closeMobileDrawer() {
  var drawer = document.getElementById('mobileDrawer');
  var overlay = document.getElementById('drawerOverlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ===========================
// Theme Toggle
// ===========================

function toggleTheme() {
  var html = document.documentElement;
  var current = html.getAttribute('data-theme');
  var newTheme = current === 'light' ? '' : 'light';
  
  if (newTheme === 'light') {
    html.setAttribute('data-theme', 'light');
    localStorage.setItem('tt-theme', 'light');
  } else {
    html.removeAttribute('data-theme');
    localStorage.setItem('tt-theme', 'dark');
  }
  
  updateThemeMeta(newTheme);
}

function updateThemeMeta(theme) {
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.content = theme === 'light' ? '#f0f2f5' : '#060a15';
  }
}

function applySavedTheme() {
  var saved = localStorage.getItem('tt-theme');
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    updateThemeMeta('light');
  } else if (saved === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    updateThemeMeta('dark');
  } else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('tt-theme', 'light');
      updateThemeMeta('light');
    }
  }
}

// Apply theme before DOM paints to prevent flash
applySavedTheme();

// ===========================
// FAQ Accordion
// ===========================

function toggleFAQ(btn) {
  var item = btn.closest('.faq-item');
  if (!item) return;
  
  var parent = item.closest('.faq-section');
  if (parent) {
    parent.querySelectorAll('.faq-item.active').forEach(function(el) {
      if (el !== item) {
        el.classList.remove('active');
        var q = el.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      }
    });
  }
  
  var isActive = item.classList.contains('active');
  item.classList.toggle('active');
  btn.setAttribute('aria-expanded', String(!isActive));
}

// ===========================
// Section Reveal on Scroll
// ===========================

function setupSectionReveal() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal-section').forEach(function(el) { observer.observe(el); });
}

// ===========================
// FAB Visibility Control
// ===========================

function setupFABVisibility() {
  var fab = document.getElementById('fab-button');
  if (!fab) return;

  var hero = document.querySelector('.hero');
  if (!hero) return;
  
  var heroHeight = hero.offsetHeight;
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > heroHeight) {
      fab.classList.add('visible');
    } else {
      fab.classList.remove('visible');
    }
  }, { passive: true });
}

// ===========================
// Cookie Consent (GDPR / Google Consent Mode v2)
// ===========================

var COOKIE_CONSENT_KEY = 'tt-cookie-consent';

function getCookieConsent() {
  try {
    var saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

function saveCookieConsent(preferences) {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
  updateConsentMode(preferences);
}

function updateConsentMode(preferences) {
  if (typeof gtag !== 'undefined') {
    gtag('consent', 'update', {
      'ad_storage': preferences.ad_storage || 'denied',
      'ad_user_data': preferences.ad_user_data || 'denied',
      'ad_personalization': preferences.ad_personalization || 'denied',
      'analytics_storage': preferences.analytics_storage || 'denied'
    });
  }
  
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('consent', 'update', {
    'ad_storage': preferences.ad_storage || 'denied',
    'ad_user_data': preferences.ad_user_data || 'denied',
    'ad_personalization': preferences.ad_personalization || 'denied',
    'analytics_storage': preferences.analytics_storage || 'denied'
  });
}

function showCookieBanner() {
  var banner = document.getElementById('cookie-consent-banner');
  if (banner) {
    banner.classList.add('visible');
  }
}

function hideCookieBanner() {
  var banner = document.getElementById('cookie-consent-banner');
  if (banner) {
    banner.classList.remove('visible');
    setTimeout(function() {
      if (banner) banner.style.display = 'none';
    }, 500);
  }
}

function acceptAllCookies() {
  saveCookieConsent({
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
    timestamp: new Date().toISOString()
  });
  hideCookieBanner();
  showToast('Cookies accepted. Thank you!', 'success');
}

function rejectAllCookies() {
  saveCookieConsent({
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    timestamp: new Date().toISOString()
  });
  hideCookieBanner();
  showToast('Privacy preferences saved.', 'info');
}

function openCookiePreferences() {
  var modal = document.getElementById('cookie-preferences-modal');
  if (modal) {
    modal.classList.add('active');
  }
}

function closeCookiePreferences() {
  var modal = document.getElementById('cookie-preferences-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function saveCookiePreferences() {
  var adStorage = document.getElementById('cookie-ad-storage');
  var adPersonalization = document.getElementById('cookie-ad-personalization');
  var analyticsStorage = document.getElementById('cookie-analytics-storage');
  
  saveCookieConsent({
    ad_storage: adStorage && adStorage.checked ? 'granted' : 'denied',
    ad_user_data: adStorage && adStorage.checked ? 'granted' : 'denied',
    ad_personalization: adPersonalization && adPersonalization.checked ? 'granted' : 'denied',
    analytics_storage: analyticsStorage && analyticsStorage.checked ? 'granted' : 'denied',
    timestamp: new Date().toISOString()
  });
  
  closeCookiePreferences();
  hideCookieBanner();
  showToast('Preferences saved!', 'success');
}

function initCookieConsent() {
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied'
  });
  
  var existing = getCookieConsent();
  if (existing) {
    updateConsentMode(existing);
  } else {
    setTimeout(showCookieBanner, 1000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCookieConsent);
} else {
  initCookieConsent();
}

// ===========================
// DOMContentLoaded: Shared Setup
// ===========================

document.addEventListener('DOMContentLoaded', function() {
  // Close drawer on overlay click
  var overlay = document.getElementById('drawerOverlay');
  if (overlay) {
    overlay.addEventListener('click', closeMobileDrawer);
  }

  // FAQ setup
  document.querySelectorAll('.faq-question').forEach(function(btn) {
    btn.addEventListener('click', function() {
      toggleFAQ(this);
    });
  });

  // Section reveal on scroll
  setupSectionReveal();

  // FAB visibility
  setTimeout(setupFABVisibility, 500);

  // Navbar scroll effect
  window.addEventListener('scroll', function() {
    var navbar = document.getElementById('navbar');
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
  }, { passive: true });

  // Handle window resize
  var resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      // Page-specific resize handlers can be added here
    }, 300);
  });
});
