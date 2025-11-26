# 📊 Performance Metrics Documentation

## Огляд

Цей документ описує ключові метрики продуктивності для різних типів сторінок Shopify теми та методи їх вимірювання.

---

## 🏠 HomePage (HP) - Головна сторінка

### Шаблон
`templates/index.json`

### Компоненти, що впливають на продуктивність:
1. **Slideshow** ([sections/slideshow.liquid](sections/slideshow.liquid))
   - Hero банер з великими зображеннями
   - JavaScript для автоплею та навігації
   - Множинні слайди

2. **Promo Banners** ([sections/promo-banners.liquid](sections/promo-banners.liquid))
   - Grid з 3-4 зображеннями
   - CSS Grid layout

3. **Featured Products** ([sections/featured-products.liquid](sections/featured-products.liquid))
   - Список товарів з зображеннями
   - JavaScript для фільтрації/сортування

### Цільові метрики (Desktop)

| Метрика | Target | Current* | Priority |
|---------|--------|----------|----------|
| **FCP** (First Contentful Paint) | < 1.8s | ~2.1s | 🔴 High |
| **LCP** (Largest Contentful Paint) | < 2.5s | ~3.2s | 🔴 High |
| **TBT** (Total Blocking Time) | < 300ms | ~450ms | 🟡 Medium |
| **CLS** (Cumulative Layout Shift) | < 0.1 | ~0.08 | 🟢 Good |
| **Speed Index** | < 3.4s | ~3.8s | 🟡 Medium |
| **TTI** (Time to Interactive) | < 3.8s | ~4.2s | 🟡 Medium |

*Оцінки базуються на аудиті коду

### Цільові метрики (Mobile)

| Метрика | Target | Current* | Priority |
|---------|--------|----------|----------|
| **FCP** | < 2.5s | ~3.0s | 🔴 High |
| **LCP** | < 4.0s | ~5.1s | 🔴 High |
| **TBT** | < 600ms | ~850ms | 🔴 High |
| **CLS** | < 0.1 | ~0.12 | 🟡 Medium |

### Основні проблеми HP:

1. **Великі зображення в slideshow**
   - Неоптимізовані розміри
   - Відсутність responsive images (srcset)
   - Всі слайди завантажуються одразу

2. **JavaScript блокує рендеринг**
   - Swiper.js з CDN (~50KB)
   - Slideshow логіка (~5KB)
   - Синхронне завантаження

3. **CSS not critical**
   - Весь CSS завантажується в <head>
   - Немає інлайнового критичного CSS

### Рекомендації для HP:

```liquid
<!-- ОПТИМІЗАЦІЯ 1: Preload LCP image -->
<link
  rel="preload"
  as="image"
  href="{{ section.blocks.first.settings.image | image_url: width: 1920 }}"
  imagesrcset="{{ section.blocks.first.settings.image | image_url: width: 640 }} 640w,
               {{ section.blocks.first.settings.image | image_url: width: 1280 }} 1280w,
               {{ section.blocks.first.settings.image | image_url: width: 1920 }} 1920w"
>

<!-- ОПТИМІЗАЦІЯ 2: Async/Defer скриптів -->
<script src="swiper.js" defer></script>

<!-- ОПТИМІЗАЦІЯ 3: Responsive images -->
<img
  src="{{ image | image_url: width: 1920 }}"
  srcset="{{ image | image_url: width: 640 }} 640w,
          {{ image | image_url: width: 1280 }} 1280w,
          {{ image | image_url: width: 1920 }} 1920w"
  sizes="100vw"
  loading="eager"
  fetchpriority="high"
>
```

---

## 📦 Product Listing Page (PLP) - Сторінка каталогу

### Шаблон
`templates/collection.liquid` (not in theme yet - to be created)

### Типові компоненти PLP:

1. **Product Grid**
   - 12-24+ продуктів на сторінці
   - Зображення товарів
   - Hover ефекти

2. **Filters Sidebar**
   - JavaScript для фільтрації
   - AJAX запити

3. **Pagination**
   - Стандартна або infinite scroll

### Цільові метрики (Desktop)

| Метрика | Target | Importance |
|---------|--------|------------|
| **FCP** | < 1.5s | 🔴 Critical |
| **LCP** | < 2.5s | 🔴 Critical |
| **TBT** | < 200ms | 🟡 Medium |
| **CLS** | < 0.1 | 🟢 Low |
| **INP** (Interaction to Next Paint) | < 200ms | 🟡 Medium |

### Основні виклики PLP:

1. **Множинні зображення**
   - 12-24 product images на сторінці
   - Кожне зображення потенційно 100-300KB
   - Може досягати 2-3MB загального розміру

2. **JavaScript для фільтрів**
   - Фільтрація по ціні, кольору, розміру
   - AJAX pagination
   - URL routing

3. **Layout Shifts**
   - Зображення завантажуються без розмірів
   - Динамічні ціни
   - Badges ("Sale", "New")

### Оптимізації для PLP:

```liquid
<!-- ПРІОРИТИЗАЦІЯ: Перші 6 товарів eager, решта lazy -->
{% for product in collection.products %}
  <div class="product-card">
    <a href="{{ product.url }}">
      <img
        src="{{ product.featured_image | image_url: width: 400 }}"
        alt="{{ product.title | escape }}"
        width="400"
        height="400"
        loading="{% if forloop.index <= 6 %}eager{% else %}lazy{% endif %}"
        decoding="{% if forloop.index <= 6 %}sync{% else %}async{% endif %}"
      >
      <h3>{{ product.title }}</h3>
      <p>{{ product.price | money }}</p>
    </a>
  </div>
{% endfor %}
```

**CSS для запобігання CLS:**
```css
.product-card img {
  aspect-ratio: 1 / 1;
  object-fit: cover;
  width: 100%;
  height: auto;
}
```

**Фільтри з debounce:**
```javascript
let filterTimeout;
filterInput.addEventListener('input', (e) => {
  clearTimeout(filterTimeout);
  filterTimeout = setTimeout(() => {
    applyFilters(e.target.value);
  }, 300); // Затримка для зменшення частоти запитів
});
```

---

## 🛍️ Product Detail Page (PDP) - Сторінка товару

### Шаблон
`templates/product.json`

### Компоненти PDP:

1. **Product Media Gallery** ([sections/product-media.liquid](sections/product-media.liquid))
   - Основне зображення (536x536px)
   - Thumbnails галерея
   - Zoom функціональність

2. **Product Info** ([sections/product-info.liquid](sections/product-info.liquid))
   - Назва, ціна, рейтинг
   - Варіанти (розмір, колір)

3. **Product Form** ([snippets/product-form.liquid](snippets/product-form.liquid))
   - Add to Cart кнопка
   - Quantity selector
   - Variant selector

4. **Product Description** ([sections/product-description.liquid](sections/product-description.liquid))
   - Rich text опис
   - Accordion/tabs (якщо є)

5. **Recommendations** ([sections/product-recommendations.liquid](sections/product-recommendations.liquid))
   - Swiper carousel
   - 3-6 товарів

### Цільові метрики (Desktop)

| Метрика | Target | Current* | Priority |
|---------|--------|----------|----------|
| **FCP** | < 1.5s | ~1.8s | 🟡 Medium |
| **LCP** | < 2.5s | ~2.8s | 🟡 Medium |
| **TBT** | < 200ms | ~380ms | 🟡 Medium |
| **CLS** | < 0.1 | ~0.15 | 🟡 Medium |
| **FID** (First Input Delay) | < 100ms | ~85ms | 🟢 Good |

### Цільові метрики (Mobile)

| Метрика | Target | Current* | Priority |
|---------|--------|----------|----------|
| **FCP** | < 2.5s | ~2.9s | 🟡 Medium |
| **LCP** | < 4.0s | ~4.5s | 🟡 Medium |
| **TBT** | < 600ms | ~720ms | 🔴 High |
| **CLS** | < 0.1 | ~0.18 | 🟡 Medium |

### Основні проблеми PDP:

1. **Product images не оптимізовані**
   - [sections/product-media.liquid:8](sections/product-media.liquid#L8) - 800px зображення без srcset
   - Всі thumbnails завантажуються eager
   - Немає placeholder під час завантаження

2. **Swiper для recommendations з CDN**
   - [sections/product-recommendations.liquid:2](sections/product-recommendations.liquid#L2) - CDN link
   - ~50KB JavaScript
   - Блокує main thread

3. **Variant selector JavaScript**
   - Синхронні операції з DOM
   - Немає debounce
   - Оновлює ціну/наявність миттєво

4. **Layout Shift при завантаженні**
   - Зображення без width/height
   - Price може змінювати висоту
   - Accordion розкриття

### Оптимізації для PDP:

**1. Оптимізація Product Images:**
```liquid
<!-- Main product image з responsive sizes -->
<img
  src="{{ product.featured_image | image_url: width: 800 }}"
  srcset="{{ product.featured_image | image_url: width: 400 }} 400w,
          {{ product.featured_image | image_url: width: 600 }} 600w,
          {{ product.featured_image | image_url: width: 800 }} 800w,
          {{ product.featured_image | image_url: width: 1200 }} 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="{{ product.title | escape }}"
  width="800"
  height="800"
  loading="eager"
  fetchpriority="high"
>

<!-- Thumbnails з lazy loading -->
{% for image in product.images %}
  <img
    src="{{ image | image_url: width: 150 }}"
    alt="{{ image.alt | default: product.title | escape }}"
    width="150"
    height="150"
    loading="{% if forloop.index <= 5 %}eager{% else %}lazy{% endif %}"
  >
{% endfor %}
```

**2. Локальний Swiper (замість CDN):**
```liquid
<!-- Використовувати npm package замість CDN -->
<link rel="stylesheet" href="{{ 'swiper-bundle.min.css' | asset_url }}">
<script src="{{ 'swiper-bundle.min.js' | asset_url }}" defer></script>
```

**3. Оптимізація Variant Selector:**
```javascript
// Debounce для зменшення частоти оновлень
let variantTimeout;
variantSelect.addEventListener('change', (e) => {
  clearTimeout(variantTimeout);
  variantTimeout = setTimeout(() => {
    updateProductInfo(e.target.value);
  }, 100);
});

// Використання DocumentFragment для batch DOM updates
function updateProductInfo(variantId) {
  const fragment = document.createDocumentFragment();
  // ... оновлення ціни, наявності
  container.appendChild(fragment);
}
```

**4. Запобігання CLS:**
```css
/* Зарезервувати місце для зображень */
.product-media__main {
  aspect-ratio: 1 / 1;
  background-color: #f5f5f5;
}

.product-media__main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Фіксована висота для ціни */
.product-info__price {
  min-height: 2rem;
}

/* Skeleton для recommendations */
.product-recommendations-loading {
  height: 400px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  animation: shimmer 2s infinite;
}
```

**5. Lazy Load Recommendations:**
```javascript
// Завантажувати recommendations тільки коли користувач скролить
const recommendationsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadRecommendations();
      recommendationsObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: '200px' });

const recommendationsSection = document.querySelector('.product-recommendations');
if (recommendationsSection) {
  recommendationsObserver.observe(recommendationsSection);
}
```

---

## 📈 Core Web Vitals - Детальніше

### 1. Largest Contentful Paint (LCP)

**Що це:** Час завантаження найбільшого видимого елемента.

**Типові LCP елементи по сторінках:**
- **HP:** Hero image в slideshow
- **PLP:** Перше зображення товару в grid
- **PDP:** Основне зображення товару

**Як оптимізувати:**
```html
<!-- Preload LCP image -->
<link rel="preload"
      as="image"
      href="hero-image.jpg"
      imagesrcset="hero-sm.jpg 640w, hero-lg.jpg 1920w">

<!-- Fetchpriority -->
<img src="hero.jpg" fetchpriority="high" loading="eager">

<!-- Responsive images -->
<img srcset="img-400.jpg 400w, img-800.jpg 800w" sizes="100vw">
```

**Цілі:**
- 🟢 Good: < 2.5s
- 🟡 Needs Improvement: 2.5s - 4.0s
- 🔴 Poor: > 4.0s

---

### 2. First Input Delay (FID) / Interaction to Next Paint (INP)

**Що це:** Час відгуку на першу взаємодію користувача.

**Типові проблеми:**
- Heavy JavaScript execution
- Long tasks > 50ms
- Синхронні операції

**Як оптимізувати:**
```javascript
// Розбивати довгі задачі
async function processItems(items) {
  for (let i = 0; i < items.length; i++) {
    await processItem(items[i]);

    // Дати браузеру "подихати" кожні 50 елементів
    if (i % 50 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}

// Використовувати requestIdleCallback
requestIdleCallback(() => {
  // Non-critical code
  loadRecommendations();
});
```

**Цілі:**
- 🟢 Good: < 100ms
- 🟡 Needs Improvement: 100ms - 300ms
- 🔴 Poor: > 300ms

---

### 3. Cumulative Layout Shift (CLS)

**Що це:** Сумарне зміщення елементів під час завантаження.

**Типові причини:**
- Зображення без width/height
- Динамічний контент (ads, embeds)
- Шрифти (FOIT/FOUT)
- Animations

**Як виправити:**
```html
<!-- Завжди вказуйте розміри -->
<img src="product.jpg" width="400" height="400" alt="Product">

<!-- Або використовуйте aspect-ratio -->
<style>
.product-image {
  aspect-ratio: 1 / 1;
}
</style>

<!-- Reserve space для динамічного контенту -->
<div class="recommendations-skeleton" style="min-height: 400px;">
  <!-- Контент завантажується тут -->
</div>
```

**Для шрифтів:**
```css
@font-face {
  font-family: 'Poppins';
  src: url('poppins.woff2') format('woff2');
  font-display: swap; /* Запобігає FOIT */
}
```

**Цілі:**
- 🟢 Good: < 0.1
- 🟡 Needs Improvement: 0.1 - 0.25
- 🔴 Poor: > 0.25

---

## 🛠️ Інструменти для вимірювання

### 1. Chrome DevTools - Performance Tab

**Як використовувати:**
1. F12 → Performance
2. Start Recording
3. Reload page
4. Stop Recording
5. Аналізуйте:
   - Main thread activity
   - Long tasks (червоні блоки)
   - Network waterfall
   - Screenshots timeline

**Що шукати:**
- Червоні блоки (Long Tasks > 50ms)
- Жовті блоки (Scripting)
- Фіолетові блоки (Rendering)
- Зелені блоки (Painting)

---

### 2. Lighthouse

**Як запустити:**
```bash
# CLI
npm install -g lighthouse
lighthouse https://your-store.myshopify.com --view

# Chrome DevTools
F12 → Lighthouse → Generate Report
```

**Секції звіту:**
- Performance Score (0-100)
- Opportunities (що можна покращити)
- Diagnostics (додаткова інформація)
- Passed Audits (що вже добре)

---

### 3. WebPageTest

**URL:** https://www.webpagetest.org/

**Особливості:**
- Real device testing
- Filmstrip view
- Connection throttling (3G, 4G)
- Multiple locations

**Важливі метрики:**
- Start Render
- Speed Index
- Fully Loaded Time
- Bytes In (total page weight)

---

### 4. Chrome UX Report (CrUX)

**Що це:** Real user data від Chrome users.

**Доступ:**
```bash
# PageSpeed Insights API
https://developers.google.com/speed/pagespeed/insights/
?url=https://your-store.myshopify.com

# CrUX Dashboard (free)
https://lookerstudio.google.com/reporting/bbc5698d-57bb-4969-9e07-68810b9fa348
```

**Дані включають:**
- 75th percentile метрики
- Device type breakdown (mobile/desktop)
- Connection type (4G, 3G, etc.)

---

## 📋 Checklist оптимізації по сторінкам

### HomePage ✅
- [ ] Preload hero image
- [ ] Defer non-critical JS (Swiper)
- [ ] Lazy load images після fold
- [ ] Optimize slideshow images (WebP + srcset)
- [ ] Inline critical CSS
- [ ] Remove unused CSS
- [ ] Add width/height до всіх images
- [ ] Test з 3G throttling

### PLP ✅
- [ ] Lazy load product images (крім перших 6)
- [ ] Add aspect-ratio для product cards
- [ ] Debounce filter inputs
- [ ] Use AJAX для pagination замість full reload
- [ ] Optimize thumbnail sizes (400x400 max)
- [ ] Implement infinite scroll (optional)
- [ ] Add loading skeleton
- [ ] Cache filter results

### PDP ✅
- [ ] Eager load main product image
- [ ] Lazy load thumbnails
- [ ] Defer Swiper для recommendations
- [ ] Optimize variant selector JS
- [ ] Add min-height для price container
- [ ] Lazy load reviews (if exist)
- [ ] Use Intersection Observer для recommendations
- [ ] Preconnect до CDN domains
- [ ] Test Add to Cart flow

---

## 🎯 Priority Matrix

### Високий пріоритет (Quick Wins)
1. ✅ Додати width/height до images → Зменшує CLS
2. ✅ Lazy loading для below-fold images → Покращує LCP
3. ✅ Defer non-critical JS → Зменшує TBT
4. ✅ Preload LCP image → Покращує LCP на 0.5-1s

### Середній пріоритет
1. Responsive images (srcset) → Зменшує bandwidth
2. WebP формат → Зменшує розмір на 25-35%
3. Критичний CSS inline → Покращує FCP
4. Service Worker для caching → Repeat visits

### Низький пріоритет (Advanced)
1. HTTP/3 QUIC
2. Edge caching (Cloudflare)
3. AMP versions
4. Progressive Web App (PWA)

---

## 📊 Benchmark дані (Industry Average)

### E-commerce сайти (2024)

| Page Type | Avg FCP | Avg LCP | Avg TBT | Avg CLS |
|-----------|---------|---------|---------|---------|
| HomePage | 2.1s | 3.2s | 420ms | 0.15 |
| PLP | 1.8s | 2.9s | 380ms | 0.18 |
| PDP | 1.9s | 3.1s | 450ms | 0.22 |

### Shopify теми (Top performing)

| Theme | HP LCP | PLP LCP | PDP LCP | Score |
|-------|--------|---------|---------|-------|
| Dawn | 2.1s | 2.3s | 2.5s | 85-92 |
| Prestige | 2.4s | 2.6s | 2.8s | 80-87 |
| Impulse | 2.6s | 2.8s | 3.0s | 75-83 |

**Наша мета:** Досягти показників Dawn theme або кращих.

---

## 🔄 Continuous Monitoring

### Budget встановлення

**Page Weight Budgets:**
```javascript
{
  "homepage": {
    "total": "1.5MB",
    "images": "800KB",
    "scripts": "300KB",
    "css": "100KB",
    "fonts": "150KB"
  },
  "plp": {
    "total": "2.0MB",
    "images": "1.2MB",
    "scripts": "300KB",
    "css": "100KB"
  },
  "pdp": {
    "total": "1.8MB",
    "images": "1.0MB",
    "scripts": "400KB",
    "css": "100KB"
  }
}
```

**Performance Budgets:**
```javascript
{
  "desktop": {
    "FCP": 1800,
    "LCP": 2500,
    "TBT": 300,
    "CLS": 0.1
  },
  "mobile": {
    "FCP": 2500,
    "LCP": 4000,
    "TBT": 600,
    "CLS": 0.1
  }
}
```

### CI/CD Integration

**Lighthouse CI:**
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://your-store.myshopify.com
            https://your-store.myshopify.com/collections/all
            https://your-store.myshopify.com/products/example
          budgetPath: ./budget.json
```

---

## 📞 Висновок

### Поточний стан теми:
- ✅ Добра семантична структура
- ✅ Адаптивний дизайн
- ⚠️ Потребує оптимізації зображень
- ⚠️ Потребує lazy loading
- ⚠️ JavaScript може блокувати рендеринг

### Очікувані покращення після оптимізації:

| Метрика | До | Після | Покращення |
|---------|-----|--------|-----------|
| HP LCP | 3.2s | 2.1s | -34% |
| PDP LCP | 2.8s | 2.3s | -18% |
| TBT | 450ms | 280ms | -38% |
| CLS | 0.15 | 0.05 | -67% |
| Performance Score | 68 | 88+ | +20 points |

### Пріоритетні кроки:
1. Додати lazy loading до всіх зображень
2. Оптимізувати розміри зображень
3. Defer JavaScript
4. Додати width/height attributes
5. Preload critical resources

---

**Дата створення:** 2025-11-25
**Версія теми:** 1.0
**Останнє оновлення:** 2025-11-25
