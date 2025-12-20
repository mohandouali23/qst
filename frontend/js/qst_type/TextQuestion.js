import Question from './Question.js';

import { showToast } from '../utils/toast.js';

export default class TextQuestion extends Question {
  constructor(step, store, renderer) {
    super(step, store, renderer);
    this.value = '';
  }

  init() {
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

    if (!this.value || this.value.trim() === '') {
      showToast('Veuillez remplir ce champ');
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
