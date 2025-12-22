import { saveAnswer } from '../../api.js';

export default class ButtonNavigation {
  constructor(container, step, { onNext, onPrevious }) {
    this.container = container;
    this.step = step;
    this.onNext = onNext;
    this.onPrevious = onPrevious;
    this.init();
  }
// save an answer in the DB for each question
  // init() {
  //   this.container.querySelector('.next-btn')?.addEventListener('click', async() => {
  //     const value = this.getValue();
  //     if (value === null) return;
  //     // Sauvegarde dans MongoDB
  //   await saveAnswer('survey_667', 'user_2', value); 
  //     this.onNext?.(value);
  //   });
  //   this.container.querySelector('.prev-btn')?.addEventListener('click', this.onPrevious);
  // }
// save all responses in the DB at the end of the questionnaire
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

