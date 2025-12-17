import Question from './Question.js';
import QuestionContent from './QuestionContent.js';
import SubQuestionRender from '../render/SubQuestionRender.js';

const subQuestionRender = new SubQuestionRender();

export default class SingleChoiceQuestion extends Question {
  constructor(step, store, renderer, allSteps) {
    super(step, store, renderer);
    this.allSteps = allSteps;
    this.subQuestionInstance = null;
  }

  init() {
    this.existingAnswer = this.getAnswer();

    // Si sous-question existante dans le store, créer l'instance
    if (this.existingAnswer?.requiresSubQstId) {
      const subStep = this.allSteps.find(s => s.id === this.existingAnswer.requiresSubQstId);
      if (subStep) {
         //subStep.isSubQuestion = true;
        this.subQuestionInstance = new QuestionContent(subStep, this.allSteps, {}, 'sub-question-template');
        this.subQuestionInstance.initComponent();
      }
    }

    // Attacher l'instance au step pour ButtonNavigation
    this.step.component = this;
  }

  onChange(selected) {
    const answer = { value: selected.value, label: selected.label };
    if (selected.precision) answer.precision = selected.precision;

    // Gérer sous-question
    if (selected.requiresSubQst?.value) {
     answer.requiresSubQstId = selected.requiresSubQst.subQst_id;

      const subStep = this.allSteps.find(s => s.id === selected.requiresSubQst.subQst_id);
      if (subStep) {
       //subStep.isSubQuestion = true;
        this.subQuestionInstance = new QuestionContent(subStep, this.allSteps, {}, 'sub-question-template');
        this.subQuestionInstance.initComponent();

        // Pré-remplir si déjà existant
        const existingSubAnswer = this.store.get(subStep.id);
        if (existingSubAnswer) this.subQuestionInstance.component.setAnswer(existingSubAnswer);
      }
    } else {
      this.subQuestionInstance = null;
    }

    this.setAnswer(answer);
  }

  render() {
    this.init();

    const container = this.renderer.renderSingleChoice(
      this.step,
      this.existingAnswer,
      (selected) => {
        this.onChange(selected);
        this.renderSubQuestion(container);
      }
    );

    this.renderSubQuestion(container);
    return container;
  }

  renderSubQuestion(container) {
    // Supprimer l'ancienne sous-question
    const oldSub = container.querySelector('.sub-question-container');
    if (oldSub) oldSub.remove();

    if (!this.subQuestionInstance) return;

    const subContainer = subQuestionRender.renderSubQuestion(this.subQuestionInstance);
    container.appendChild(subContainer);

    // Mettre à jour le store quand la sous-question change
    const subComp = this.subQuestionInstance.component;
    if (subComp?.setAnswer) {
      const originalSetAnswer = subComp.setAnswer.bind(subComp);
      subComp.setAnswer = (val) => {
        originalSetAnswer(val);

       // Mettre à jour UNIQUEMENT la réponse principale avec la sous-question imbriquée
        const mainAnswer = this.getAnswer() || {};
        mainAnswer.subAnswer = {
          id: this.subQuestionInstance.step.id,
          value: val
        };
        
        // Sauvegarder UNIQUEMENT la réponse principale
        this.setAnswer(mainAnswer);
      };
    }
  }
}

// export default class SingleChoiceQuestion extends Question{
//   constructor(step, store, renderer, allSteps) {
//     super(step, store, renderer);
//     this.step = step;
//     this.store = store;
//     this.renderer = renderer;
//     this.allSteps = allSteps; // Toutes les étapes du survey pour trouver les subQst
//     this.subQuestionInstance = null;
//   }

//   init() {
//     this.existingAnswer = this.store.get(this.step.id) || null;

//     // Si sous-question existante dans store, créer instance
//     if (this.existingAnswer?.subAnswer && this.existingAnswer.requiresSubQstId) {
//       const subStep = this.allSteps.find(s => s.id === this.existingAnswer.requiresSubQstId);
//       if (subStep) {
//         this.subQuestionInstance = new QuestionContent(subStep);
//       }
//     }
//   }

//   onChange(selected) {
//     // selected = { value, label, precision }

//     const answer = {
//       value: selected.value,
//       label: selected.label
//     };
//     if (selected.precision) answer.precision = selected.precision;

//     // Gérer sous-question
//     if (selected.requiresSubQst?.value) {
//       answer.requiresSubQstId = selected.requiresSubQst.subQst_id;

//       // créer l’instance de sous-question
//       const subStep = this.allSteps.find(s => s.id === selected.requiresSubQst.subQst_id);
//       if (subStep) {
//         const existingSubAnswer = this.store.get(subStep.id) || null;
//         // On passe un template spécial pour la sous-question
//         this.subQuestionInstance = new QuestionContent(
//           subStep,
//           this.allSteps,
//           {}, // ou sources si nécessaire
//           'sub-question-template' // ID du template spécifique pour sous-question
//         );
//          // Pré-remplir la sous-question
//     if (existingSubAnswer) {
//       this.subQuestionInstance.initComponent?.();
//       this.subQuestionInstance.component?.setAnswer(existingSubAnswer);
//     }

//     // On conserve dans l'answer principal
//    // answer.subAnswer = existingSubAnswer;
//       }
//     } else {
//       this.subQuestionInstance = null;
//     }

//     // si déjà existant un sous-answer, on le conserve
//     // if (this.subQuestionInstance) {
//     //   const subStepId = answer.requiresSubQstId;
//     //   answer.subAnswer = this.store.get(subStepId) || null;
//     // }
    

//     this.store.set(this.step.id, answer);
//   }

//   render() {
//     this.init();
    
//     const container = this.renderer.renderSingleChoice(
//       this.step,
//       this.existingAnswer,
//       (selected) => {
//         this.onChange(selected);
//         // ré-rendu sous-question si nécessaire
//         this.renderSubQuestion(container);
//       }
//     );

//     // Affichage initial sous-question
//     this.renderSubQuestion(container);

//     return container;
//   }

//   renderSubQuestion(container) {
//     // Supprimer l'ancienne sous-question
//     const oldSub = container.querySelector('.sub-question-container');
//     if (oldSub) oldSub.remove();

//     if (this.subQuestionInstance) {
//         this.subQuestionInstance.initComponent?.();
//         const subContainer = subQuestionRender.renderSubQuestion(this.subQuestionInstance);

//         // Écouter les changements sur la sous-question
//         const subComp = this.subQuestionInstance.component;
//         if (subComp) {
//             // si la sous-question a une méthode onChange
//             const originalSetAnswer = subComp.setAnswer?.bind(subComp);
//             subComp.setAnswer = (answer) => {
//                 if (originalSetAnswer) originalSetAnswer(answer);
//                 // Mettre à jour la subAnswer dans la question principale
//                 const mainAnswer = this.store.get(this.step.id) || {};
//                 mainAnswer.subAnswer = answer;
//                 this.store.set(this.step.id, mainAnswer);
//             }
//         }

//         container.appendChild(subContainer);
//     }
// }

// }
