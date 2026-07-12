const thumbs = document.querySelectorAll('.thumb');
const mainImage = document.querySelector('#mainProductImage');
const CONFIG = {
  productName: 'Nac+Resveratrol',
  productPrice: 149000,
  currency: 'PYG',
  origin: 'landing_nac_resveratrol',
  supabaseUrl: 'https://roruinqorwgolcrhhmpm.supabase.co',
  supabaseAnonKey: 'sb_publishable_aRPb1yNunMEheat00BxwtQ_Uft732KJ',
  supabaseTable: 'pedidos_web',
  metaPixelId: '2412226475899711',
  ga4Id: 'G-8WM6CYEB73',
};

/* ---- Analytics: Meta Pixel + GA4 (IDs compartidos entre landings) ---- */
function isConfigured(value) {
  return Boolean(value) && !/^(PEGAR_AQUI|G-XXXX|TU_|YOUR_|XXXX)/i.test(value);
}

function metaProductParams(extra) {
  return Object.assign({
    content_name: CONFIG.productName,
    content_type: 'product',
    value: CONFIG.productPrice,
    currency: CONFIG.currency,
  }, extra || {});
}

function initMetaPixel() {
  if (!isConfigured(CONFIG.metaPixelId)) return;
  !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', CONFIG.metaPixelId);
  fbq('track', 'PageView');
  fbq('track', 'ViewContent', metaProductParams());
}

function initGA4() {
  if (!isConfigured(CONFIG.ga4Id)) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.ga4Id}`;
  document.head.appendChild(script);
  window.gtag('js', new Date());
  window.gtag('config', CONFIG.ga4Id);
}

function metaTrack(eventName, payload) {
  if (typeof fbq !== 'function') return;
  const value = payload.subtotal || payload.precio || CONFIG.productPrice;
  const quantity = payload.cantidad || 1;
  if (eventName === 'begin_checkout') {
    fbq('track', 'InitiateCheckout', metaProductParams({ value }));
  } else if (eventName === 'generate_lead') {
    fbq('track', 'Lead', metaProductParams({ value }));
    fbq('track', 'Purchase', metaProductParams({ value, num_items: quantity }));
  }
}

function trackEvent(eventName, payload = {}) {
  const data = {
    producto: CONFIG.productName,
    precio: CONFIG.productPrice,
    moneda: CONFIG.currency,
    origen: CONFIG.origin,
    url: window.location.href,
    ...payload,
  };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...data });
  if (typeof window.gtag === 'function') window.gtag('event', eventName, data);
  metaTrack(eventName, data);
}

thumbs.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    thumbs.forEach((item) => item.classList.remove('active'));
    thumb.classList.add('active');
    mainImage.src = thumb.dataset.image;
  });
});

const offerDuration = 10 * 60;
let remaining = offerDuration;
const minutes = document.querySelector('#minutes');
const seconds = document.querySelector('#seconds');

function updateTimer() {
  const currentMinutes = Math.floor(remaining / 60);
  const currentSeconds = remaining % 60;

  minutes.textContent = String(currentMinutes).padStart(2, '0');
  seconds.textContent = String(currentSeconds).padStart(2, '0');

  remaining = remaining > 0 ? remaining - 1 : offerDuration;
}

updateTimer();
setInterval(updateTimer, 1000);

document.querySelector('.gallery-arrow')?.addEventListener('click', () => {
  const currentIndex = Array.from(thumbs).findIndex((thumb) => thumb.classList.contains('active'));
  const nextThumb = thumbs[(currentIndex + 1) % thumbs.length];
  nextThumb.click();
});

const viewerCount = document.querySelector('#viewerCount');

function updateViewerCount() {
  if (!viewerCount) return;

  const nextCount = Math.floor(Math.random() * 12) + 9;
  viewerCount.textContent = String(nextCount);
}

setInterval(updateViewerCount, 6500);

const purchaseForm = document.querySelector('#purchaseForm');
const orderForms = document.querySelectorAll('[data-order-form]');
const confirmation = document.querySelector('#confirmation');
const orderNumber = document.querySelector('#orderNumber');
const confirmationPhone = document.querySelector('#confirmationPhone');
const confirmationPaymentText = document.querySelector('#confirmationPaymentText');
const productPage = document.querySelector('[data-page="product"]');
const checkoutPage = document.querySelector('[data-page="checkout"]');
const buyButton = document.querySelector('#pedido');
const backLink = document.querySelector('.back-link');
const closeCheckout = document.querySelector('.checkout-close');
const quantitySelect = document.querySelector('#quantitySelect');
const productPriceTop = document.querySelector('#productPriceTop');
const summaryQuantityText = document.querySelector('#summaryQuantityText');
const summaryQuantity = document.querySelector('#summaryQuantity');
const summaryTotal = document.querySelector('#summaryTotal');
const cityInput = document.querySelector('#cityInput');
const deliveryNotice = document.querySelector('#deliveryNotice');
const paymentNote = document.querySelector('#paymentNote');
const formError = document.querySelector('#formError');
let map;
let mapMarker;
let selectedMapLink = '';
const pricesByQuantity = {
  1: 149000,
  2: 246000,
  3: 320000,
};

function formatGuarani(value) {
  return `Gs. ${Number(value).toLocaleString('es-PY')}`;
}

function getQuantityText(quantity) {
  return `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'}`;
}

function updateOrderSummary() {
  if (!quantitySelect) return;

  const quantity = Number(quantitySelect.value || 1);
  const price = pricesByQuantity[quantity] || pricesByQuantity[1];
  const quantityText = getQuantityText(quantity);
  const totalText = formatGuarani(price);

  if (productPriceTop) productPriceTop.textContent = totalText;
  if (summaryQuantityText) summaryQuantityText.textContent = quantityText;
  if (summaryQuantity) summaryQuantity.textContent = quantityText;
  if (summaryTotal) summaryTotal.textContent = totalText;
}

function isCashOnDeliveryArea(value) {
  const city = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const centralCities = ['asuncion', 'central', 'san lorenzo', 'fernando de la mora', 'luque', 'capitata', 'capiata', 'lambare', 'mariano roque alonso', 'nemby', 'ñemby', 'villa elisa', 'san antonio', 'limpio', 'itaugua', 'ita', 'aregua', 'ypane', 'yaguaron'];

  return centralCities.some((area) => city.includes(area.normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
}

function updateDeliveryNotice() {
  if (!cityInput || !deliveryNotice || !paymentNote) return;

  const value = cityInput.value.trim();
  const isKnownCashArea = value && isCashOnDeliveryArea(value);

  deliveryNotice.classList.toggle('delivery-ok', Boolean(isKnownCashArea));
  deliveryNotice.classList.toggle('delivery-interior', Boolean(value && !isKnownCashArea));

  if (!value) {
    deliveryNotice.textContent = 'Asunción y Central: pago contra entrega. Interior: se coordina una seña previa por WhatsApp.';
    paymentNote.textContent = 'Asunción y Central: no pagás nada ahora, abonás al recibir.';
    return;
  }

  if (isKnownCashArea) {
    deliveryNotice.textContent = 'Zona habilitada para pago contra entrega. No abonás nada ahora.';
    paymentNote.textContent = 'No pagás nada ahora, abonás al recibir.';
    return;
  }

  deliveryNotice.textContent = 'Para envíos al interior se coordina una seña previa por WhatsApp antes del despacho.';
  paymentNote.textContent = 'Interior: se coordina una seña previa por WhatsApp y el saldo al recibir.';
}

function setDeliveryNoticeText(notice, value) {
  if (!notice) return;

  const isKnownCashArea = value && isCashOnDeliveryArea(value);
  notice.classList.toggle('delivery-ok', Boolean(isKnownCashArea));
  notice.classList.toggle('delivery-interior', Boolean(value && !isKnownCashArea));

  if (!value) {
    notice.textContent = 'Asunción y Central: pago contra entrega. Interior: se coordina una seña previa por WhatsApp.';
    return;
  }

  notice.textContent = isKnownCashArea
    ? 'Zona habilitada para pago contra entrega. No abonás nada ahora.'
    : 'Para envíos al interior se coordina una seña previa por WhatsApp antes del despacho.';
}

function initFormDeliveryNotices() {
  orderForms.forEach((form) => {
    const city = form.querySelector('[name="city"]');
    const notice = form.querySelector('.delivery-notice');
    if (!city || !notice) return;

    setDeliveryNoticeText(notice, city.value.trim());
    city.addEventListener('input', () => setDeliveryNoticeText(notice, city.value.trim()));
  });
}

function setMapLink(link) {
  selectedMapLink = link;
  const mapLinkInput = document.querySelector('#mapLinkInput');
  const mapOpenLink = document.querySelector('#mapOpenLink');

  if (mapLinkInput) mapLinkInput.value = link;
  if (mapOpenLink) mapOpenLink.href = link || 'https://www.google.com/maps';
}

function createGoogleMapsLink(lat, lng) {
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

function updateMapLocation(lat, lng, zoom = 16) {
  setMapLink(createGoogleMapsLink(lat, lng));

  if (!map) return;
  map.setView([lat, lng], zoom);
  if (!mapMarker) {
    mapMarker = L.marker([lat, lng], { draggable: true }).addTo(map);
    mapMarker.on('dragend', () => {
      const position = mapMarker.getLatLng();
      updateMapLocation(position.lat, position.lng, map.getZoom());
    });
    return;
  }

  mapMarker.setLatLng([lat, lng]);
}

function initMapInstance() {
  if (map || typeof L === 'undefined') return;

  const defaultLocation = [-25.2637, -57.5759];
  map = L.map('mapPicker', { zoomControl: true }).setView(defaultLocation, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map);
  map.on('click', (event) => updateMapLocation(event.latlng.lat, event.latlng.lng, map.getZoom()));
  updateMapLocation(defaultLocation[0], defaultLocation[1], 13);
}

function openMapModal() {
  const mapModal = document.querySelector('#mapModal');
  if (!mapModal) return;

  mapModal.classList.remove('hidden');
  initMapInstance();
  setTimeout(() => { if (map) map.invalidateSize(); }, 100);
}

function closeMapModal() {
  document.querySelector('#mapModal')?.classList.add('hidden');
}

async function searchMapLocation() {
  const mapSearch = document.querySelector('#mapSearch');
  const mapError = document.querySelector('#mapError');
  const query = mapSearch?.value.trim();

  if (!query) {
    if (mapError) mapError.textContent = 'Escribí una dirección o lugar para buscar.';
    return;
  }

  if (mapError) mapError.textContent = 'Buscando ubicación...';
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(`${query}, Paraguay`)}`);
    const results = await response.json();
    if (!results.length) {
      if (mapError) mapError.textContent = 'No encontramos esa dirección. Probá con otra referencia.';
      return;
    }

    updateMapLocation(Number(results[0].lat), Number(results[0].lon), 17);
    if (mapError) mapError.textContent = 'Tocá el mapa o arrastrá el pin para ajustar la ubicación exacta.';
  } catch (error) {
    if (mapError) mapError.textContent = 'No se pudo buscar. Tocá directamente el mapa para marcar la ubicación.';
  }
}

function initMapPicker() {
  document.querySelector('[data-open-map]')?.addEventListener('click', openMapModal);
  document.querySelectorAll('[data-close-map]').forEach((button) => button.addEventListener('click', closeMapModal));
  document.querySelector('#mapModal')?.addEventListener('click', (event) => {
    if (event.target.id === 'mapModal') closeMapModal();
  });
  document.querySelector('#mapSearchButton')?.addEventListener('click', searchMapLocation);
  document.querySelector('#mapSearch')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchMapLocation();
    }
  });
  document.querySelector('#mapLinkInput')?.addEventListener('input', (event) => {
    selectedMapLink = event.target.value.trim();
    const mapOpenLink = document.querySelector('#mapOpenLink');
    if (mapOpenLink) mapOpenLink.href = selectedMapLink || 'https://www.google.com/maps';
  });
  document.querySelector('#mapConfirm')?.addEventListener('click', () => {
    const link = document.querySelector('#mapLinkInput')?.value.trim() || selectedMapLink;
    const mapsInput = document.querySelector('#mapsInput');
    if (mapsInput) mapsInput.value = link;
    closeMapModal();
  });
}

function showCheckout() {
  if (!productPage || !checkoutPage) return;

  productPage.hidden = true;
  checkoutPage.hidden = false;
  document.body.classList.add('checkout-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const quantity = Number(quantitySelect?.value || 1);
  trackEvent('begin_checkout', { cantidad: quantity, subtotal: pricesByQuantity[quantity] || pricesByQuantity[1] });
  window.VisitorTracker?.trackEcommerce('begin_checkout', { revenue: pricesByQuantity[quantity] || pricesByQuantity[1] });
}

function showProduct() {
  if (!productPage || !checkoutPage) return;

  checkoutPage.hidden = true;
  productPage.hidden = false;
  document.body.classList.remove('checkout-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function generateOrderNumber() {
  return `#PY${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
}

function getComboName(quantity) {
  return `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'}`;
}

function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem('nadOrders') || '[]');
  orders.push(order);
  localStorage.setItem('nadOrders', JSON.stringify(orders));
}

async function saveOrderToSupabase(order) {
  const response = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${CONFIG.supabaseTable}`, {
    method: 'POST',
    headers: {
      apikey: CONFIG.supabaseAnonKey,
      Authorization: `Bearer ${CONFIG.supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Error guardando pedido en Supabase.');
  }
}

function showConfirmation(order) {
  if (orderNumber) orderNumber.textContent = order.id;
  if (confirmationPhone) confirmationPhone.textContent = order.phone || '---';
  if (confirmationPaymentText) {
    confirmationPaymentText.innerHTML = order.paymentMode === 'cash_on_delivery'
      ? `Recordá que el pago se realiza al recibir el producto. Te hablaremos al número <strong>${order.phone || '---'}</strong>.`
      : `Para envíos al interior coordinaremos una seña previa por WhatsApp. Te hablaremos al número <strong>${order.phone || '---'}</strong>.`;
  }

  checkoutPage.hidden = true;
  confirmation?.classList.remove('hidden');
  document.body.classList.add('checkout-open');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function closeConfirmation() {
  confirmation?.classList.add('hidden');
  showProduct();
}

buyButton?.addEventListener('click', (event) => {
  event.preventDefault();
  showCheckout();
});

backLink?.addEventListener('click', (event) => {
  event.preventDefault();
  showProduct();
});

closeCheckout?.addEventListener('click', showProduct);
document.querySelector('[data-close-confirmation]')?.addEventListener('click', closeConfirmation);
confirmation?.addEventListener('click', (event) => {
  if (event.target.id === 'confirmation') closeConfirmation();
});
quantitySelect?.addEventListener('change', updateOrderSummary);
cityInput?.addEventListener('input', updateDeliveryNotice);
updateOrderSummary();
updateDeliveryNotice();
initMapPicker();
initFormDeliveryNotices();

orderForms.forEach((form) => form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const quantity = Number(formData.get('quantity') || 1);
  const submitButton = form.querySelector('button[type="submit"]');
  const currentFormError = form.querySelector('.form-error') || formError;
  const order = {
    id: generateOrderNumber(),
    product: CONFIG.productName,
    combo: getComboName(quantity),
    quantity,
    total: pricesByQuantity[quantity] || pricesByQuantity[1],
    customer_name: String(formData.get('name') || '').trim(),
    customer_phone: String(formData.get('phone') || '').trim(),
    city: String(formData.get('city') || '').trim(),
    address: String(formData.get('address') || '').trim(),
    neighborhood: String(formData.get('neighborhood') || '').trim(),
    reference: String(formData.get('notes') || '').trim(),
    maps_url: String(formData.get('map') || '').trim(),
    paymentMode: isCashOnDeliveryArea(String(formData.get('city') || '')) ? 'cash_on_delivery' : 'deposit_required_for_interior',
    status: 'pending_confirmation',
    created_at: new Date().toISOString(),
  };

  const urlParams = new URLSearchParams(window.location.search);
  const referenceParts = [`Oferta: ${order.combo}`];
  if (order.neighborhood) referenceParts.push(`Barrio: ${order.neighborhood}`);
  if (order.reference) referenceParts.push(`Referencia: ${order.reference}`);
  referenceParts.push(order.paymentMode === 'deposit_required_for_interior' ? 'Interior: coordinar seña previa' : 'Pago contra entrega');

  const supabaseOrder = {
    id: order.id,
    producto: order.product,
    precio: order.total,
    cantidad: order.quantity,
    subtotal: order.total,
    nombre: order.customer_name,
    telefono: order.customer_phone,
    correo: 'No informado',
    ci: 'No informado',
    departamento: 'Paraguay',
    ciudad: order.city,
    direccion: order.address || 'No informado',
    referencia: referenceParts.join(' | '),
    ubicacion_maps: order.maps_url || 'No informado',
    estado: 'Pendiente',
    origen: CONFIG.origin,
    created_at: order.created_at,
    user_agent: navigator.userAgent,
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    fbclid: urlParams.get('fbclid'),
    gclid: urlParams.get('gclid'),
  };

  if (currentFormError) currentFormError.textContent = '';
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando pedido...';
  }

  try {
    saveOrder(order);
    await saveOrderToSupabase(supabaseOrder);
    trackEvent('generate_lead', { combo: order.combo, cantidad: order.quantity, subtotal: order.total });
    window.VisitorTracker?.trackEcommerce('generate_lead', { orderId: order.id, revenue: order.total });
    window.VisitorTracker?.trackEcommerce('purchase', { orderId: order.id, revenue: order.total });
  } catch (error) {
    console.error(error);
    if (currentFormError) currentFormError.textContent = 'No se pudo guardar el pedido. Revisá la conexión o la configuración de Supabase.';
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Realizar pedido';
    }
    return;
  }

  form.reset();
  updateOrderSummary();
  updateDeliveryNotice();
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = 'Realizar pedido';
  }
  showConfirmation({
    id: order.id,
    phone: order.customer_phone,
    paymentMode: order.paymentMode,
  });
}));

// ---- Tracker de visitantes (alimenta "Visitantes en tiempo real" del panel admin) ----
(function initVisitorTracker() {
  const SUPABASE_URL = CONFIG.supabaseUrl;
  const SUPABASE_KEY = CONFIG.supabaseAnonKey;
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  const TRACK_URL = SUPABASE_URL.replace(/\/$/, '') + '/functions/v1/track-visitor';
  const sessionId = sessionStorage.getItem('lp_session_id') ||
    ('sess_' + Math.random().toString(36).slice(2, 15) + '_' + Date.now().toString(36));
  sessionStorage.setItem('lp_session_id', sessionId);
  let hb = null;

  function send(event, extra) {
    const p = new URLSearchParams(location.search);
    try {
      fetch(TRACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY },
        body: JSON.stringify(Object.assign({
          event, sessionId, pageUrl: location.href, pageTitle: document.title,
          referrer: document.referrer, userAgent: navigator.userAgent,
          screenResolution: screen.width + 'x' + screen.height,
          viewport: window.innerWidth + 'x' + window.innerHeight,
          landingPage: CONFIG.origin, timestamp: new Date().toISOString(),
          utmSource: p.get('utm_source'), utmMedium: p.get('utm_medium'),
          utmCampaign: p.get('utm_campaign'), utmContent: p.get('utm_content'), utmTerm: p.get('utm_term'),
        }, extra || {})),
        keepalive: event === 'page_hide',
      }).catch(() => {});
    } catch (e) { /* noop */ }
  }

  function startHb() { if (!hb) hb = setInterval(() => { if (document.visibilityState === 'visible') send('heartbeat'); }, 30000); }
  function stopHb() { if (hb) { clearInterval(hb); hb = null; } }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { send('page_hide'); stopHb(); } else { send('page_view'); startHb(); }
  });
  window.addEventListener('pagehide', () => send('page_hide'));

  send('page_view');
  startHb();

  window.VisitorTracker = {
    trackEvent: send,
    trackEcommerce: (evt, data) => { data = data || {}; send(evt, { productName: data.productName || CONFIG.productName, productPrice: data.productPrice || CONFIG.productPrice, orderId: data.orderId, revenue: data.revenue }); },
    getSessionId: () => sessionId,
  };
})();

initGA4();
initMetaPixel();
trackEvent('view_item');
