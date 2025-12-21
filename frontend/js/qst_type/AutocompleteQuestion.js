import Question from './Question.js';
import { showToast } from '../utils/toast.js';

export default class AutocompleteQuestion extends Question {
  constructor(step, store, renderer, sourceData = []) {
    super(step, store, renderer);
    this.sourceData = sourceData;
    this.selectedValue = null;
  }
  init() {
    const answer = this.getAnswer();
    this.selectedValue = answer?.value ?? null;
  
    console.log('Autocomplete init - selectedValue:', this.selectedValue);
  }
  
  buildAnswerObject() {
    return {
      questionId: this.step.id,
      type: 'autocomplete',
      value: this.selectedValue
    };
  }
  onChange(item) {
    this.selectedValue = item;
   this.setAnswer(this.buildAnswerObject());
  }
isValid() {
    if (
      this.selectedValue === null ||
      this.selectedValue === undefined ||
      (typeof this.selectedValue === 'string' && this.selectedValue.trim() === '')
    ) {
      showToast('Veuillez choisir une valeur dans la liste');
      return false;
    }
    return true;
  }
  render() {
    this.init();
    return this.renderer.renderAutocomplete(
      this.step,
      this.sourceData,
      this.selectedValue,
      (item) => this.onChange(item)
    );
  }
}
