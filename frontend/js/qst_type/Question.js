export default class Question {
  constructor(step, store, renderer) {
    this.step = step;
    this.store = store;
    this.renderer = renderer;
  }

 getAnswer() {
  // CAS SOUS-QUESTION
  if (this.step.parentQuestionId) {
    const parentAnswer = this.store.get(this.step.parentQuestionId);
    if (!parentAnswer) return null;

    // ✅ CAS SINGLE_CHOICE
    if (parentAnswer.subAnswer?.[this.step.id]) {
      return parentAnswer.subAnswer[this.step.id];
    }

    // ✅ CAS MULTIPLE_CHOICE
    if (Array.isArray(parentAnswer.value)) {
      for (const opt of parentAnswer.value) {
        if (opt.subAnswer?.[this.step.id]) {
          return opt.subAnswer[this.step.id];
        }
      }
    }

    return null;
  }

  // CAS QUESTION PRINCIPALE
  return this.store.get(this.step.id);
}

 // getAnswer() {
  //   // CAS SOUS-QUESTION
  //   if (this.step.parentQuestionId) {
  //     const parentAnswer = this.store.get(this.step.parentQuestionId);
  //     if (parentAnswer?.subAnswer?.[this.step.id]) {
  //       return parentAnswer.subAnswer[this.step.id];
  //     }
  //     return null;
  //   }

  //   //  CAS QUESTION PRINCIPALE
  //   return this.store.get(this.step.id);
  // }
  setAnswer(answerObject) {
    //  une sous-question ne s'enregistre jamais seule
    if (this.step.isSubQuestion ||this.step.parentQuestionId) return;
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
