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

// import Question from './Question.js';

// export default class SpinnerQuestion extends Question {
//   constructor(step, store, renderer) {
//     super(step, store, renderer);
//     this.selected = null; // { codeItem, value }
//   }

//   init() {
//     // récupère la valeur depuis le store
//     this.selected = this.getAnswer() || null;
//   }

//   onChange(selectedValue) {
//     // Trouver l'objet correspondant dans options
//     const selectedObj = this.step.options.find(opt => opt.value === selectedValue) || null;
//     this.selected = selectedObj;
//     this.setAnswer(this.selected); // stocker l'objet entier
//   }

//   render() {
//     this.init();
//     // délègue le rendu au renderer
//     return this.renderer.renderSpinner(
//       this.step,
//       this.selected?.value || '',
//       (val) => this.onChange(val)
//     );
//   }
// }
