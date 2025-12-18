export default class Question {
  constructor(step, store, renderer) {
    this.step = step;
    this.store = store;
    this.renderer = renderer;
  }

  getAnswer() {
    return this.store.get(this.step.id);
  }

  // setAnswer(value) {
  //   if (this.step.isSubQuestion) return;
  //   this.store.set(this.step.id, value);
  // }

  setAnswer(answerObject) {
    if (this.step.isSubQuestion) return;
    this.store.set(this.step.id, answerObject);
  }

  isValid() {
    if (!this.step.required) return true;
    return this.getAnswer() !== null;
  }

  render() {
    throw new Error('Render doit être implémenté');
  }
}
