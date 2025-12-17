export default class Question {
    constructor(step, store, renderer) {
      this.step = step;
      this.store = store;
      this.renderer = renderer;
    }
  
    getAnswer() {
      return this.store.get(this.step.id);
    }
  
    setAnswer(value) {
      this.store.set(this.step.id, value);
    }
    isValid() {
      if (!this.step.required) return true;
      return this.getAnswer() != null;
    }
    
    // isValid() {
    //   if (!this.step.required) return true;
    //   const answer = this.getAnswer();
    //   return answer !== null && answer !== undefined && answer.length > 0;
    // }
  
    render() {
      throw new Error("Render doit être implémenté par la sous-classe");
    }
  }
  