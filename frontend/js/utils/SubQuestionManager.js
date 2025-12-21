// import QuestionContent from '../qst_type/QuestionContent.js';
// import SubQuestionRender from '../render/SubQuestionRender.js';

// const subQuestionRender = new SubQuestionRender();

// export default class SubQuestionManager {
//   constructor(allSteps, store) {
//     this.allSteps = allSteps;
//     this.store = store;
//     this.instances = {}; // { parentValue: QuestionContent }
//   }

//   // Créer ou récupérer une sous-question pour une option
//   createSubQuestion(option, existingSubAnswer = null) {
//     const subStep = this.allSteps.find(s => s.id === option.requiresSubQst?.subQst_id);
//     if (!subStep) return null;

//     const instance = new QuestionContent(subStep, this.allSteps, {}, 'sub-question-template');
//     instance.initComponent();
//     instance.parentValue = option.value;

//     // Pré-remplir si une réponse existe
//     if (existingSubAnswer) {
//       instance.component.setAnswer(existingSubAnswer);
//     }

//     this.instances[option.value] = instance;

//     // Retourner l'instance pour manipulation
//     return instance;
//   }

//   // Rendu générique d'une sous-question
//   renderSubQuestions(container) {
//     Object.values(this.instances).forEach(subInstance => {
//       let subContainer = container.querySelector(`.sub-question-container[data-parent="${subInstance.parentValue}"]`);
//       if (!subContainer) {
//         subContainer = subQuestionRender.renderSubQuestion(subInstance);
//         subContainer.dataset.parent = subInstance.parentValue;
//         container.appendChild(subContainer);
//       }

//       const comp = subInstance.component;
//       if (!comp.setAnswerOriginal) {
//         comp.setAnswerOriginal = comp.setAnswer?.bind(comp) || ((val) => {});
//         comp.setAnswer = (val) => {
//           // Mettre à jour la valeur dans le store principal
//           const mainAnswer = this.store.get(subInstance.parentValue) || {};
//           mainAnswer.subAnswer = { id: subInstance.step.id, value: val };
//           this.store.set(subInstance.parentValue, mainAnswer);

//           // Appeler l'original pour ne rien casser
//           comp.setAnswerOriginal(val);
//         };
//       }
//     });
//   }

//   // Récupérer la réponse d’une sous-question
//   getSubAnswer(parentValue) {
//     const instance = this.instances[parentValue];
//     if (!instance) return null;
//     return instance.component.getAnswer();
//   }

//   // Validation générique d'une sous-question
//   isValid(parentValue) {
//     const instance = this.instances[parentValue];
//     if (!instance) return true;
//     const answer = instance.component.getAnswer();
//     const step = instance.step;
//     return answer !== null && step && step.required ? !!answer : true;
//   }

//   // Supprimer une sous-question
//   removeSubQuestion(parentValue) {
//     delete this.instances[parentValue];
//   }
// }
