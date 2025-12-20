import Question from './Question.js';

import { showToast } from '../utils/toast.js';

export default class SpinnerQuestion extends Question {
  constructor(step, store, renderer, sourceData = []) {
    super(step, store, renderer);
    this.value = null;           // valeur sélectionnée
    this.sourceData = sourceData; // options du spinner
    this.onChangeBound = this.onChange.bind(this); // binding sûr pour l'event
  }

  init() {
    const answer = this.getAnswer();
    this.value = answer?.value ?? null;
  }

  buildAnswerObject() {
    return {
      questionId: this.step.id,
      type: 'spinner',
      value: this.value
    };
  }

  onChange(selectedValue) {
    this.value = selectedValue;
    this.setAnswer(this.buildAnswerObject());
  }
isValid() {
    if (this.value === null || this.value === undefined || (typeof this.value === 'string' && this.value.trim() === '')) {
      showToast('Veuillez sélectionner une option');
      return false;
    }
    return true;
  }

  render() {
    this.init();
    // délègue le rendu au renderer
    return this.renderer.renderSpinner(
      this.step,
      this.value,
      this.onChangeBound // utilise la version bindée
    );
  }
}
