export default class AnswerStore {
  constructor() {
    this.answers = {};
  }

  get(id) {
    return this.answers.hasOwnProperty(id)
      ? this.answers[id]
      : null;
  }

  set(id, value) {
    this.answers[id] = value;
  }

  remove(id) {
    delete this.answers[id];
  }

  getAll() {
    return this.answers;
  }
}


// export default class AnswerStore {
//   constructor() {
//     this.answers = {};
//   }

//   get(id) {
//     return this.answers[id] || [];
//   }

//   set(id, value) {
//     this.answers[id] = value;
//   }

//   getAll() {
//     return this.answers;
//   }
// }
