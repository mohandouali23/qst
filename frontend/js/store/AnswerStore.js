export default class AnswerStore {
    constructor() {
      this.answers = {};
    }
  
    get(id) {
      return this.answers[id] || [];
    }
  
    set(id, value) {
      this.answers[id] = value;
    }
  
    getAll() {
      return this.answers;
    }
  }
  