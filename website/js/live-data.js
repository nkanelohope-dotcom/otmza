/**
 * On The Move ZA – Live data from backend API
 * Automatically updates website when admin makes changes.
 */
(function () {
  const API = '/api';

  function formatPrice(n) {
    return 'R' + Number(n || 0).toLocaleString('en-ZA');
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function serviceCard(s) {
    const img = s.image
      ? `<img src="${escapeHtml(s.image)}" alt="${escapeHtml(s.name)}">`
      : `<img src="images/logo2.jpeg" alt="${escapeHtml(s.name)}">`;
    const features = (s.features || []).slice(0, 4).map(f =>
      `<li><i class="fas fa-check" style="color:var(--primary-green,#1a7a4c);margin-right:6px"></i>${escapeHtml(f)}</li>`
    ).join('');
    return `
      <div class="service-card" data-service-id="${escapeHtml(s.id)}">
        <div class="card-img">${img}</div>
        <div class="card-body">
          <h3>${escapeHtml(s.name)}</h3>
          <p>${escapeHtml(s.shortDescription || s.description || '')}</p>
          ${features ? `<ul style="list-style:none;padding:0;margin:10px 0;font-size:0.88rem;color:#555">${features}</ul>` : ''}
          <div class="price-from">From ${formatPrice(s.priceFrom)}</div>
          <a href="pricing.html#${escapeHtml(s.id)}" class="card-link">View pricing →</a>
        </div>
      </div>`;
  }

  async function loadServicesInto(selector, options = {}) {
    const el = document.querySelector(selector);
    if (!el) return;
    try {
      const res = await fetch(API + '/services');
      if (!res.ok) throw new Error('API error');
      let services = await res.json();
      if (options.category) {
        services = services.filter(s => s.category === options.category);
      }
      if (options.limit) services = services.slice(0, options.limit);
      if (!services.length) {
        el.innerHTML = '<p style="text-align:center;color:#888">No services available yet.</p>';
        return;
      }
      el.innerHTML = services.map(serviceCard).join('');
    } catch (err) {
      console.warn('Could not load live services:', err.message);
      // keep existing static HTML as fallback
    }
  }

  async function loadPricingPanels() {
    const container = document.getElementById('live-pricing');
    if (!container) return;
    try {
      const [services, pricing] = await Promise.all([
        fetch(API + '/services').then(r => r.json()),
        fetch(API + '/pricing').then(r => r.json())
      ]);
      if (!services.length) return;

      // Build tabs + panels
      let tabsHtml = '<div class="pricing-tabs">';
      let panelsHtml = '';
      services.forEach((s, i) => {
        const items = pricing.filter(p => p.serviceId === s.id);
        tabsHtml += `<button class="pricing-tab${i === 0 ? ' active' : ''}" data-target="panel-${s.id}">${escapeHtml(s.name)}</button>`;
        panelsHtml += `<div class="pricing-panel${i === 0 ? ' active' : ''}" id="panel-${s.id}">
          <h3 style="margin-bottom:12px">${escapeHtml(s.name)}</h3>
          ${s.description ? `<p style="margin-bottom:16px;color:#555">${escapeHtml(s.description)}</p>` : ''}
          ${(s.features || []).length ? `<ul style="margin-bottom:16px">${s.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}
          <table class="pricing-table">
            <thead><tr><th>Package</th><th>Price</th></tr></thead>
            <tbody>
              ${items.map(p => `<tr><td>${escapeHtml(p.label)}</td><td><strong>${formatPrice(p.price)}</strong> <small>${escapeHtml(p.unit || '')}</small></td></tr>`).join('') || '<tr><td colspan="2">Contact us for a quote</td></tr>'}
            </tbody>
          </table>
        </div>`;
      });
      tabsHtml += '</div>';
      container.innerHTML = tabsHtml + panelsHtml;

      // re-bind tab clicks
      container.querySelectorAll('.pricing-tab').forEach(tab => {
        tab.addEventListener('click', function () {
          container.querySelectorAll('.pricing-tab').forEach(t => t.classList.remove('active'));
          container.querySelectorAll('.pricing-panel').forEach(p => p.classList.remove('active'));
          this.classList.add('active');
          const panel = document.getElementById(this.getAttribute('data-target'));
          if (panel) panel.classList.add('active');
        });
      });
    } catch (err) {
      console.warn('Could not load live pricing:', err.message);
    }
  }

  async function applySettings() {
    try {
      const s = await fetch(API + '/settings').then(r => r.json());
      document.querySelectorAll('[data-setting]').forEach(el => {
        const key = el.getAttribute('data-setting');
        if (s[key] != null) {
          if (el.tagName === 'A' && key === 'email') el.href = 'mailto:' + s[key];
          if (el.tagName === 'A' && key === 'phone') el.href = 'tel:' + s[key].replace(/\s/g, '');
          el.textContent = s[key];
        }
      });
    } catch (e) { /* ignore */ }
  }

  // Auto-run based on page
  document.addEventListener('DOMContentLoaded', function () {
    // Home page services grid
    if (document.getElementById('live-services')) {
      loadServicesInto('#live-services');
    }
    // Services page
    if (document.getElementById('live-services-full')) {
      loadServicesInto('#live-services-full');
    }
    // Pricing page
    if (document.getElementById('live-pricing')) {
      loadPricingPanels();
    }
    applySettings();
  });

  // Expose for manual use
  window.OTMZA = { loadServicesInto, loadPricingPanels, applySettings, formatPrice };
})();
