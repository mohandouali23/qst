import Question from './Question.js';

export default class SpinnerQuestion extends Question {
  constructor(step, store, renderer) {
    super(step, store, renderer);
    this.value = '';
  }

  init() {
    // récupère la valeur depuis le store
    this.value = this.getAnswer() || '';
  }

  onChange(newValue) {
    this.value = newValue;
    this.setAnswer(this.value);
  }

  render() {
    this.init();
    // délègue le rendu au renderer
    return this.renderer.renderSpinner(
      this.step,
      this.value,
      (val) => this.onChange(val)
    );
  }
}
