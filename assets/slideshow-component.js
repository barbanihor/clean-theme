class SlideshowComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('.slider');
    this.sliderItems = this.querySelectorAll('.slider__slide');
    this.pageCount = this.sliderItems.length;
    this.currentPage = 0;
  }

  connectedCallback() {
    if (this.slider && this.pageCount > 0) {
      this.slider.setAttribute('role', 'list');
      this.sliderItems.forEach((slide, index) => {
        slide.setAttribute('role', 'listitem');
        slide.setAttribute('aria-label', `${index + 1} of ${this.pageCount}`);
      });
    }
  }
}

customElements.define('slideshow-component', SlideshowComponent);
