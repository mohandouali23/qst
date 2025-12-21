
export default class ButtonNavigation {
  constructor(container, step, { onNext, onPrevious }) {
    this.container = container;
    this.step = step;
    this.onNext = onNext;
    this.onPrevious = onPrevious;
    this.init();
  }

  init() {
    this.container.querySelector('.next-btn')?.addEventListener('click', () => {
      const value = this.getValue();
      if (value === null) return;
      this.onNext?.(value);
    });
    this.container.querySelector('.prev-btn')?.addEventListener('click', this.onPrevious);
  }

 getValue() {
  if (!this.questionContent) return null;

  if (!this.questionContent.isValid()) {
    return null;
  }

  return this.questionContent.getAnswer();
}
}