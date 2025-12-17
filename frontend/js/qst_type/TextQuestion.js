import Question from './Question.js';

export default class TextQuestion extends Question {
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

    // le renderer prend la step, la valeur actuelle et un callback onChange
    return this.renderer.renderText(
      this.step,
      this.value,
      (val) => this.onChange(val)
    );
  }
}
