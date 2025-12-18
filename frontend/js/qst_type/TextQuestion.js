import Question from './Question.js';

export default class TextQuestion extends Question {
  constructor(step, store, renderer) {
    super(step, store, renderer);
    this.value = '';
  }

  init() {
    //this.value = this.getAnswer() ?? '';

    const answer = this.getAnswer();
    this.value = answer?.value ?? '';
  }
  buildAnswerObject() {
    return {
      questionId: this.step.id,
      type: 'text',
      value: this.value
    };
  }
  onChange(newValue) {
    this.value = newValue;
   // this.setAnswer(this.value);
   this.setAnswer(
    this.buildAnswerObject()
  );
  }

  isValid() {
    if (!this.step.required) return true;

    if (typeof this.value !== 'string') return false;
    if (this.value.trim() === '') return false;

    if (this.step.minLength && this.value.length < this.step.minLength) {
      return false;
    }

    if (this.step.maxLength && this.value.length > this.step.maxLength) {
      return false;
    }

    return true;
  }

  render() {
    this.init();

    return this.renderer.renderText(
      this.step,
      this.value,
      (val) => this.onChange(val)
    );
  }
}
