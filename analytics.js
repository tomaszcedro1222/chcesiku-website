(() => {
  "use strict";

  const measurementId = "G-FXTJ25VR00";
  const storageKey = "chcesiku_analytics_consent";
  let banner;

  function startAnalytics() {
    if (document.querySelector(`script[data-ga-id="${measurementId}"]`)) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", { analytics_storage: "granted" });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { anonymize_ip: true });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.dataset.gaId = measurementId;
    document.head.appendChild(script);
  }

  function saveChoice(value) {
    localStorage.setItem(storageKey, value);
    banner.hidden = true;
    if (value === "granted") {
      if (window.gtag) window.gtag("consent", "update", { analytics_storage: "granted" });
      startAnalytics();
    } else if (window.gtag) {
      window.gtag("consent", "update", { analytics_storage: "denied" });
    }
  }

  function createBanner() {
    banner = document.createElement("section");
    banner.className = "consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Ustawienia analityki");
    banner.setAttribute("aria-live", "polite");
    banner.hidden = true;
    banner.innerHTML = `
      <div class="consent-inner">
        <div>
          <strong>Pomóż nam ulepszać Chcę Siku!</strong>
          <p>Za Twoją zgodą użyjemy Google Analytics do zbiorczych statystyk odwiedzin. Bez zgody analityka nie zostanie uruchomiona. <a href="/privacy.html#analityka">Dowiedz się więcej</a>.</p>
        </div>
        <div class="consent-actions">
          <button type="button" class="consent-button consent-reject">Odrzucam</button>
          <button type="button" class="consent-button consent-accept">Akceptuję analitykę</button>
        </div>
      </div>`;
    document.body.appendChild(banner);
    banner.querySelector(".consent-reject").addEventListener("click", () => saveChoice("denied"));
    banner.querySelector(".consent-accept").addEventListener("click", () => saveChoice("granted"));
  }

  document.addEventListener("DOMContentLoaded", () => {
    createBanner();
    document.querySelectorAll("[data-open-consent]").forEach((button) => {
      button.addEventListener("click", () => {
        banner.hidden = false;
        banner.querySelector(".consent-reject").focus();
      });
    });

    const choice = localStorage.getItem(storageKey);
    if (choice === "granted") startAnalytics();
    else if (choice !== "denied") banner.hidden = false;
  });
})();
