// On The Move ZA - Main JavaScript

document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
      });
    });
  }

  // Pricing tabs
  const tabs = document.querySelectorAll('.pricing-tab');
  const panels = document.querySelectorAll('.pricing-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = this.getAttribute('data-target');

      tabs.forEach(function (t) {
        t.classList.remove('active');
      });
      panels.forEach(function (p) {
        p.classList.remove('active');
      });

      this.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) {
        panel.classList.add('active');
      }
    });
  });

  // Contact / Booking form handler
  const forms = document.querySelectorAll('.contact-form form, #booking-form');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = form.querySelector('[name="name"]')?.value || '';
      const phone = form.querySelector('[name="phone"]')?.value || '';
      const service = form.querySelector('[name="service"]')?.value || 'General Enquiry';
      const message = form.querySelector('[name="message"]')?.value || '';

      // Build WhatsApp message
      let waMsg = 'Hello On The Move ZA!%0A%0A';
      waMsg += '*Name:* ' + encodeURIComponent(name) + '%0A';
      waMsg += '*Phone:* ' + encodeURIComponent(phone) + '%0A';
      waMsg += '*Service:* ' + encodeURIComponent(service) + '%0A';
      if (message) {
        waMsg += '*Message:* ' + encodeURIComponent(message) + '%0A';
      }
      waMsg += '%0AI would like to book / enquire about your services.';

      const waUrl = 'https://wa.me/27743538569?text=' + waMsg;
      window.open(waUrl, '_blank');

      // Optional success feedback
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        const original = btn.innerHTML;
        btn.innerHTML = '✓ Opening WhatsApp...';
        btn.disabled = true;
        setTimeout(function () {
          btn.innerHTML = original;
          btn.disabled = false;
        }, 3000);
      }
    });
  });

  // Set active nav link based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
});
