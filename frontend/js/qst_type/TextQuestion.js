import Question from './Question.js';

import { showToast } from '../utils/toast.js';

export default class TextQuestion extends Question {
  constructor(step, store, renderer) {
    super(step, store, renderer);
    this.value = '';
  }

  init() {
   const answer = this.getAnswer();
   console.log('TextQuestion init - answer:', answer, 'step.id:', this.step.id);
  // Mettre à jour this.value avec la réponse stockée
  if (answer?.value !== undefined && answer?.value !== null) {
    this.value = answer.value;
  } else {
    this.value = '';
  }
  
  console.log('TextQuestion init - this.value après init:', this.value);
  this.step.component = this;
  }

  buildAnswerObject() {
    return {
      questionId: this.step.id,
      type: 'text',
      value: this.value
    };
  }
  onChange(newValue) {
    console.log('TextQuestion onChange - newValue:', newValue);
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
    console.log('TextQuestion render - this.value:', this.value)
    this.init();

    return this.renderer.renderText(
      this.step,
      this.value,
      (val) => this.onChange(val)
    );
  }
  
}
