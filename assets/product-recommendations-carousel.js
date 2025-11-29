class ProductRecommendationsCarousel extends HTMLElement {
  constructor() {
    super();

    this.productId = this.getAttribute('product-id');
    this.limit = parseInt(this.getAttribute('limit')) || 8;
    this.sectionId = 'product-recommendations';
    this.swiperInstance = null;
  }

  connectedCallback() {
    if (!this.productId) {
      console.error('Product ID is required');
      return;
    }

    this.showLoadingState();
    this.fetchRecommendations();
  }

  showLoadingState() {
    this.innerHTML = `
      <div class="product-recommendations-loading">
        <div class="product-recommendations-loading__spinner"></div>
        <p class="product-recommendations-loading__text">Loading recommendations...</p>
      </div>
    `;
  }

  async fetchRecommendations() {
    const url = `/recommendations/products?section_id=${this.sectionId}&product_id=${this.productId}&limit=${this.limit}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();

      if (html && html.trim().length > 0) {
        this.innerHTML = html;

        this.initSwiper();
      } else {
        this.innerHTML =
          '<p style="text-align: center; padding: 2rem; color: #999;">No recommendations available</p>';
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      this.innerHTML =
        '<p style="text-align: center; padding: 2rem; color: #d9534f;">Unable to load recommendations</p>';
    }
  }

  initSwiper() {
    let attempts = 0;
    const maxAttempts = 50;

    const tryInit = () => {
      attempts++;

      if (typeof Swiper === 'undefined') {
        if (attempts < maxAttempts) {
          setTimeout(tryInit, 100);
        }
        return;
      }

      const swiperEl = this.querySelector('.product-recommendations-swiper');
      if (!swiperEl) {
        if (attempts < maxAttempts) {
          setTimeout(tryInit, 100);
        }
        return;
      }

      if (this.swiperInstance) {
        return;
      }

      try {
        this.swiperInstance = new Swiper(swiperEl, {
          slidesPerView: 1,
          spaceBetween: 20,
          navigation: {
            nextEl: this.querySelector('.product-recommendations-next'),
            prevEl: this.querySelector('.product-recommendations-prev'),
          },
          breakpoints: {
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
          },
          watchOverflow: true,
          observer: true,
          observeParents: true,
        });
      } catch (error) {
        console.error('Swiper init error:', error);
      }
    };

    tryInit();
  }
}

customElements.define('product-recommendations-carousel', ProductRecommendationsCarousel);
