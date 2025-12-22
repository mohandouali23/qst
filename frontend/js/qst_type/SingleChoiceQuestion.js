import Question from './Question.js';
import QuestionContent from './QuestionContent.js';
import SubQuestionRender from '../render/SubQuestionRender.js';
import { showToast } from '../utils/toast.js';

const subQuestionRender = new SubQuestionRender();

export default class SingleChoiceQuestion extends Question {
  constructor(step, store, renderer, allSteps = [], sources = {}) {
    super(step, store, renderer);
    this.allSteps = allSteps;
    this.sources = sources;
    this.selectedOption = null;
    this.subQuestionInstance = null;
    this._isRendering = false;
    this._hasInitialized = false;
  }

  /************** INITIALISATION **************/
  init() {
    if (this._hasInitialized) return;

    this.existingAnswer = this.getAnswer();
    this.restoreMainAnswer();
    this.restoreSubQuestion();

    this.step.component = this;
    this._hasInitialized = true;
  }

  restoreMainAnswer() {
    if (!this.existingAnswer?.value) return;

    const { codeItem, precision } = this.existingAnswer.value;
    this.selectedOption = this.step.options.find(o => o.codeItem === codeItem);
    if (precision) this.selectedOption.precision = precision;
  }

  restoreSubQuestion() {
    if (this.step.parentQuestionId) return;
    const subAnswerObj = this.existingAnswer?.subAnswer;
    if (!subAnswerObj) return;

    const subStepId = Object.keys(subAnswerObj)[0];
    const subStep = this.allSteps.find(s => s.id === subStepId);
    if (!subStep) return;

    this.initSubQuestion(subStep, subAnswerObj[subStepId]);
  }

  /************** LOGIQUE COMMUNE SUB-QUESTION **************/
  initSubQuestion(subStep, existingSubAnswer = null) {
    subStep.parentQuestionId = this.step.id;

    const tableData = subStep.table ? { [subStep.table]: this.sources[subStep.table] || [] } : {};
    this.subQuestionInstance = new QuestionContent(subStep, this.allSteps, tableData, 'sub-question-template');
    this.subQuestionInstance.initComponent();

    if (existingSubAnswer) {
      Promise.resolve().then(() => this.subQuestionInstance.component?.setAnswer(existingSubAnswer));
    }

    // Propager la réponse vers le parent
    const subComp = this.subQuestionInstance.component;
    if (subComp) {
      const originalSetAnswer = subComp.setAnswer.bind(subComp);
      subComp.setAnswer = val => {
        originalSetAnswer(val);
        this.setAnswer(this.buildAnswerObject());
      };
    }
  }

  /************** BUILD ANSWER **************/
  buildAnswerObject() {
    if (!this.selectedOption) return null;

    const answer = {
      questionId: this.step.id,
      type: 'single_choice',
      value: {
        codeItem: this.selectedOption.codeItem,
        label: this.selectedOption.label,
        ...(this.selectedOption.precision?.trim() && { precision: this.selectedOption.precision })
      }
    };

    if (this.subQuestionInstance && !this.step.parentQuestionId) {
      const subAnswer = this.subQuestionInstance.component?.buildAnswerObject?.();

      if (subAnswer) answer.subAnswer = { [this.subQuestionInstance.step.id]: subAnswer };
    }

    return answer;
  }
  /************** GESTION UTILISATEUR **************/
  onChange(selected) {
    this.selectedOption = this.step.options.find(o => o.codeItem === selected.value);
    // Gestion précision uniquement si elle existe et n'est pas vide
  if (selected.precision?.trim()) {
    this.selectedOption.precision = selected.precision;
  } else {
    delete this.selectedOption.precision; // Supprimer la clé si vide
  }

    if (!this.step.parentQuestionId && selected.requiresSubQst?.value) {
      const subStep = this.allSteps.find(s => s.id === selected.requiresSubQst.subQst_id);
      if (subStep) {
        const existingSub = this.existingAnswer?.subAnswer?.[subStep.id] || this.store.get(subStep.id);
        this.initSubQuestion(subStep, existingSub);
      }
    } else {
      this.subQuestionInstance = null;
    }

    this.setAnswer(this.buildAnswerObject());
  }

  /************** VALIDATION **************/
  isValid() {
    if (!this.selectedOption?.codeItem) {
      showToast('Veuillez sélectionner une option');
      return false;
    }

    if (this.selectedOption.requiresPrecision && (!this.selectedOption.precision?.trim())) {
      showToast('Veuillez préciser votre réponse');
      return false;
    }

    if (this.subQuestionInstance && !this.step.parentQuestionId) {
      return this.subQuestionInstance.isValid?.() ?? true;
    }

    return true;
  }

  /************** RENDER **************/
  render() {
    this._isRendering = true;
    if (!this._hasInitialized) this.init();

    const answerForRender = this.existingAnswer || this.getAnswer();
    const container = this.renderer.renderSingleChoice(
      this.step,
      answerForRender,
      selected => {
        this.onChange(selected);
        if (!this.step.parentQuestionId) this.renderSubQuestion(container);
      }
    );

    if (!this.step.parentQuestionId) this.renderSubQuestion(container);
    this._isRendering = false;
    return container;
  }

  renderSubQuestion(container) {
    if (!this.subQuestionInstance || this.step.parentQuestionId) return;

    const oldSub = container.querySelector('.sub-question-container');
    if (oldSub) oldSub.remove();

    const subContainer = subQuestionRender.renderSubQuestion(this.subQuestionInstance);
    container.appendChild(subContainer);
  }

  /************** RESET **************/
  reset() {
    this._hasInitialized = false;
    this._isRendering = false;
    this.existingAnswer = null;
    this.selectedOption = null;
    this.subQuestionInstance = null;
  }
}

// import Question from './Question.js';
// import QuestionContent from './QuestionContent.js';
// import SubQuestionRender from '../render/SubQuestionRender.js';
// import { showToast } from '../utils/toast.js';

// const subQuestionRender = new SubQuestionRender();

// export default class SingleChoiceQuestion extends Question {
//   constructor(step, store, renderer, allSteps = [], sources = {}) {
//     super(step, store, renderer);
//     this.allSteps = allSteps;
//     this.sources = sources;
//     this.selectedOption = null;
//     this.subQuestionInstance = null;
//     this.precisionHandler = null;
//     this._isRendering = false;
//     this._hasInitialized = false; 
//   }
  
//   /**********************************Restauration depuis le store***************************************************** */
//   init() {
//     // Éviter la double initialisation
//     if (this._hasInitialized) {
//       return;
//     }
    
//     this.existingAnswer = this.getAnswer();
//     console.log("réponse existante :this.existingAnswer", this.existingAnswer);
    
//     // Restaurer la sélection principale
//     if (this.existingAnswer?.value) {
//       this.selectedOption = this.step.options.find(
//         o => o.codeItem === this.existingAnswer.value.codeItem
//       );
//       // Restaurer la précision
//       if (this.existingAnswer.value.precision) {
//         this.selectedOption.precision = this.existingAnswer.value.precision;
//       }
//     } else {
//       this.selectedOption = null;
//     }
    
//     // Restaurer la sous-question seulement si c'est la question parente
//     if (!this.step.parentQuestionId) {
//       const subAnswerObj = this.existingAnswer?.subAnswer;
//       console.log("sub obj", subAnswerObj);
      
//       if (subAnswerObj) {
//         const subStepId = Object.keys(this.existingAnswer.subAnswer)[0];
//         console.log("sub id", subStepId);

//         // id de subQST
//         const subStep = this.allSteps.find(s => s.id === subStepId);
//         if (subStep) {
//           // Marquer la sous-question comme enfant
//           subStep.parentQuestionId = this.step.id;
          
//           const tableData = subStep.table ? { [subStep.table]: this.sources[subStep.table] || [] } : {};
//           this.subQuestionInstance = new QuestionContent(subStep, this.allSteps, tableData, 'sub-question-template');
//           this.subQuestionInstance.initComponent();
//           console.log("subInstance ", this.subQuestionInstance);
          
//           const existingSubAnswer = subAnswerObj[subStepId];
//           console.log("existingSubAnswer", existingSubAnswer);
          
//           if (existingSubAnswer) {
//             // Utiliser Promise pour attendre l'initialisation
//             Promise.resolve().then(() => {
//               if (this.subQuestionInstance?.component?.setAnswer) {
//                 this.subQuestionInstance.component.setAnswer(existingSubAnswer);
//               }
//             });
//           }
          
//           // Redéfinir setAnswer pour propager au parent
//           const subComp = this.subQuestionInstance.component;
//           if (subComp) {
//             const originalSetAnswer = subComp.setAnswer.bind(subComp);
//             subComp.setAnswer = (val) => {
//               originalSetAnswer(val);
//               this.setAnswer(this.buildAnswerObject());
//             };
//           }
//         }
//       } else {
//         this.subQuestionInstance = null;
//       }
//     }

//     this.step.component = this;
//     this._hasInitialized = true;
//   }

//   /**********************************Format stocké********************************************************************************* */
//   buildAnswerObject() {
//     if (!this.selectedOption) return null;

//     const valueObj = {
//       codeItem: this.selectedOption.codeItem,
//       label: this.selectedOption.label,
//       precision: this.selectedOption.precision || null
//     };

//     const answer = {
//       questionId: this.step.id,
//       type: 'single_choice',
//       value: valueObj
//     };

//     // Ajouter la sous-question si elle existe ET si c'est la question parente
//     if (this.subQuestionInstance && !this.step.parentQuestionId) {
//       const subAnswerObj = this.subQuestionInstance.component?.buildAnswerObject?.();
//       if (subAnswerObj) {
//         answer.subAnswer = {
//           [this.subQuestionInstance.step.id]: subAnswerObj
//         };
//       }
//     }

//     return answer;
//   }
  
//   /**************************************************************************Interaction utilisateur************************************** */
//   onChange(selected) {
//     this.selectedOption = this.step.options.find(o => o.codeItem === selected.value);
    
//     // Gestion précision
//     if (selected.precision) {
//       this.selectedOption.precision = selected.precision;
//     }
//     console.log('selectedOption complète:', this.selectedOption);

//     // Gestion sous-question seulement si c'est la question parente
//     if (!this.step.parentQuestionId) {
//       if (selected.requiresSubQst?.value) {
//         const subStep = this.allSteps.find(s => s.id === selected.requiresSubQst.subQst_id);
//         console.log('subStep', subStep);
        
//         if (subStep) {
//           // Marquer comme sous-question
//           subStep.parentQuestionId = this.step.id;
          
//           const tableData = subStep.table ? 
//             { [subStep.table]: this.sources[subStep.table] || [] } : {}; 
          
//           this.subQuestionInstance = new QuestionContent(subStep, this.allSteps, tableData, 'sub-question-template');
//           this.subQuestionInstance.initComponent();
          
//           // Pré-remplir depuis la réponse parente d'abord
//           let existingSubAnswer = null;
//           if (this.existingAnswer?.subAnswer?.[subStep.id]) {
//             existingSubAnswer = this.existingAnswer.subAnswer[subStep.id];
//           } else {
//             existingSubAnswer = this.store.get(subStep.id);
//           }
          
//           if (existingSubAnswer && this.subQuestionInstance.component) {
//             Promise.resolve().then(() => {
//               this.subQuestionInstance.component.setAnswer(existingSubAnswer);
//             });
//           }
          
//           // redéfinir setAnswer pour propager au parent
//           const subComp = this.subQuestionInstance.component;
//           if (subComp) {
//             const originalSetAnswer = subComp.setAnswer.bind(subComp);
//             subComp.setAnswer = (val) => {
//               originalSetAnswer(val);
//               this.setAnswer(this.buildAnswerObject());
//             };
//           }
//         }
//       } else {
//         this.subQuestionInstance = null;
//       }
//     }
    
//     // Sauvegarder la réponse principale avec buildAnswerObject
//     this.setAnswer(this.buildAnswerObject());
//   }

//   /**********************************************Validation complète********************* */
//   isValid() {
//     console.log("this.selectedOption", this.selectedOption);
    
//     // Vérification réponse principale
//     if (!this.selectedOption?.codeItem) {
//       showToast('Veuillez sélectionner une option');
//       return false;
//     }
    
//     // Vérification précision 
//     if (this.selectedOption.requiresPrecision && (!this.selectedOption.precision || this.selectedOption.precision.trim() === '')) {
//       showToast('Veuillez préciser votre réponse');
//       return false;
//     }
    
//     // Validation récursive sous-question seulement si c'est la question parente
//     if (this.subQuestionInstance && !this.step.parentQuestionId) {
//       const subValid = this.subQuestionInstance.isValid?.();
//       if (!subValid) return false;
//     }

//     return true;
//   }
  
//   /**********************************************************Affichage principal*********************************** */
//   render() {
//     this._isRendering = true;
    
//     // Initialiser seulement si pas déjà fait
//     if (!this._hasInitialized) {
//       this.init();
//     }
    
//     // Récupérer existingAnswer après init
//     const answerForRender = this.existingAnswer || this.getAnswer();
    
//     const container = this.renderer.renderSingleChoice(
//       this.step,
//       answerForRender, // Passer la réponse garantie
//       (selected) => {
//         this.onChange(selected);
//         if (!this.step.parentQuestionId) {
//           this.renderSubQuestion(container);
//         }
//       }
//     );

//     if (!this.step.parentQuestionId) {
//       this.renderSubQuestion(container);
//     }
    
//     this._isRendering = false;
//     return container;
//   }
  
//   renderSubQuestion(container) {
//     if (!this.subQuestionInstance || this.step.parentQuestionId) return;

//     const oldSub = container.querySelector('.sub-question-container');
//     if (oldSub) oldSub.remove();

//     const subContainer = subQuestionRender.renderSubQuestion(this.subQuestionInstance);
//     container.appendChild(subContainer);
//   }

//   // Méthode pour réinitialiser
//   reset() {
//     this._hasInitialized = false;
//     this._isRendering = false;
//     this.existingAnswer = null;
//     this.selectedOption = null;
//     this.subQuestionInstance = null;
//   }
// }
