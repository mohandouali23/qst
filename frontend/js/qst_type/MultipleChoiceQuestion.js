import Question from './Question.js';
import ExclusiveRule from '../rules/ExclusiveRule.js';
import QuestionContent from './QuestionContent.js';
import SubQuestionRender from '../render/SubQuestionRender.js';
import { showToast } from '../utils/toast.js';

const subQuestionRender = new SubQuestionRender();

export default class MultipleChoiceQuestion extends Question {
  constructor(step, store, renderer, allSteps, sources = {}) {
    super(step, store, renderer);
    this.selectedValues = [];
    this.allSteps = allSteps;
    this.sources = sources;
    this.subQuestionInstances = {};
    this.container = null;
  }
  init() {
    const answer = this.getAnswer();
    this.selectedValues = answer?.value || [];
  
    // reset UI instances
    this.subQuestionInstances = {};
  
    this.step.options.forEach(option => {
      if (!option.requiresSubQst?.value) return;
  
      const selectedObj = this.selectedValues.find(v => v.value === option.value);
      if (!selectedObj?.subAnswer) return;
  
      const subStepId = Object.keys(selectedObj.subAnswer)[0];
      const subAnswerData = selectedObj.subAnswer[subStepId];
  
      const subStep = this.allSteps.find(s => s.id === subStepId);
      if (!subStep) return;
  
      // créer instance UI
      const tableData = subStep.table
        ? { [subStep.table]: this.sources[subStep.table] || [] }
        : {};
  
      const instance = new QuestionContent(
        subStep,
        this.allSteps,
        tableData,
        'sub-question-template'
      );
  
      instance.initComponent();
      instance.parentValue = option.value;
      console.log(" instance.parentValue", instance.parentValue)
      //  RESTAURATION DE LA VALEUR (DATA → UI)
      if (subAnswerData && instance.component?.setAnswer) {
        instance.component.setAnswer(subAnswerData);
      }
  
      // stocker l’instance UNIQUEMENT côté UI
      this.subQuestionInstances[option.value] = instance;
    });
  
    this.step.component = this;
  }
  
// init() {
//   const answer = this.getAnswer();
//   this.selectedValues = answer?.value || [];

//   // Réinitialiser les instances existantes
//   this.subQuestionInstances = {};

//   // Pré-créer les sous-questions pour toutes les options cochées avec sous-question
//   this.step.options.forEach(option => {
//     if (!option.requiresSubQst?.value) return;

//     const selectedObj = this.selectedValues.find(v => v.value === option.value);
//     if (!selectedObj) return;

//     const subStep = this.allSteps.find(s => s.id === option.requiresSubQst.subQst_id);
//     if (!subStep) return;

//     // Créer l'instance de sous-question
//     const tableData = subStep.table ? { [subStep.table]: this.sources[subStep.table] || [] } : {};
//     const instance = new QuestionContent(subStep, this.allSteps, tableData, 'sub-question-template');
//     instance.initComponent();

//     // Restaurer la valeur précédente de la sous-question si elle existe
//     if (selectedObj.subAnswer?.instance?.component?.getAnswer) {
//       instance.component?.setAnswer(selectedObj.subAnswer.instance.getAnswer());
//     }

//     // Mettre à jour selectedValues et subQuestionInstances
//     selectedObj.subAnswer = { instance, value: selectedObj.subAnswer?.value || null };
//     this.subQuestionInstances[option.value] = instance;
//   });

//   this.step.component = this;
// }

  buildAnswerObject() {
    return {
      questionId: this.step.id,
      type: 'multiple_choice',
      value: this.selectedValues.map(v => {
        const obj = {
          codeItem: v.codeItem,
          value: v.value
        };

        if (v.precision) obj.precision = v.precision;

        // if (v.subAnswer?.instance?.component) {
        //   const subAnswerObj = v.subAnswer.instance.component.buildAnswerObject?.();
        //   obj.subAnswer = {
        //     [v.subAnswer.instance.step.id]: subAnswerObj || { questionId: v.subAnswer.instance.step.id, type: v.subAnswer.instance.step.type, value: null }
        //   };
        // }
        if (v.subAnswer) {
          obj.subAnswer = {
            [v.subAnswer.questionId]: v.subAnswer
          };
        }
        
        return obj;
      })
    };
  }

  isValid() {
    if (!this.selectedValues || this.selectedValues.length === 0) {
      showToast('Veuillez sélectionner au moins une option');
      return false;
    }

    for (const selected of this.selectedValues) {
      const optionMeta = this.step.options.find(o => o.value === selected.value);

      if (optionMeta?.requiresPrecision && (!selected.precision || selected.precision.trim() === '')) {
        showToast(`Veuillez préciser votre réponse pour "${optionMeta.label}"`);
        return false;
      }

      if (selected.subAnswer?.instance?.component) {
        const subVal = selected.subAnswer.instance.component.buildAnswerObject?.()?.value;
        if (!subVal) {
          showToast(`Veuillez répondre à la sous-question pour "${optionMeta.label}"`);
          return false;
        }

        if (selected.subAnswer.instance.component.isValid && !selected.subAnswer.instance.component.isValid()) {
          return false;
        }
      }
    }

    return true;
  }

  handleOption(option, checked, precision = null) {
    const idx = this.selectedValues.findIndex(v => v.value === option.value);

    if (checked) {
      const obj = { value: option.value, codeItem: option.codeItem };
      if (precision?.trim()) obj.precision = precision.trim();

      if (idx >= 0) {
        this.selectedValues[idx] = { ...this.selectedValues[idx], ...obj };
      } else {
        this.selectedValues.push(obj);
      }

      if (option.requiresSubQst?.value) {
        const subStep = this.allSteps.find(s => s.id === option.requiresSubQst.subQst_id);
        if (subStep && !this.subQuestionInstances[option.value]) {
          const tableData = subStep.table ? { [subStep.table]: this.sources[subStep.table] || [] } : {};
          const instance = new QuestionContent(subStep, this.allSteps, tableData, 'sub-question-template');
          instance.initComponent();
          instance.parentValue = option.value;
          this.subQuestionInstances[option.value] = instance;

          const selectedObj = this.selectedValues.find(v => v.value === option.value);
          //selectedObj.subAnswer = { instance };
        }
      }

    } else {
      this.selectedValues = this.selectedValues.filter(v => v.value !== option.value);
      delete this.subQuestionInstances[option.value];
    }

    // Appliquer règle exclusive
    const subAnswersBackup = this.selectedValues.reduce((acc, v) => {
      if (v.subAnswer) acc[v.value] = v.subAnswer;
      return acc;
    }, {});
    this.selectedValues = ExclusiveRule.apply(this.step.options, this.selectedValues, option.value);

    this.selectedValues = this.selectedValues.map(v => ({
      ...v,
      subAnswer: v.subAnswer ?? subAnswersBackup[v.value]
    }));

    this.setAnswer(this.buildAnswerObject());
    this.renderer.syncCheckboxes(this.step.id, this.selectedValues.map(v => v.value));

    if (this.container) this.renderSubQuestions(this.container);
  }

  onChange(option) {
    return (checked, precision = null) => this.handleOption(option, checked, precision);
  }

  render() {
    this.init();
    this.container = this.renderer.renderMultipleChoice(this.step, this.selectedValues, option => this.onChange(option));
    this.renderSubQuestions(this.container);
    return this.container;
  }
renderSubQuestions(container) {
  Object.values(this.subQuestionInstances).forEach(subInstance => {
    let subContainer = container.querySelector(`.sub-question-container[data-parent="${subInstance.parentValue}"]`);

    if (!subContainer) {
      subContainer = subQuestionRender.renderSubQuestion(subInstance);
      subContainer.dataset.parent = subInstance.parentValue;
      container.appendChild(subContainer);
    }

    const comp = subInstance.component;

    if (!comp.setAnswerOriginal) {
      comp.setAnswerOriginal = comp.setAnswer?.bind(comp) || (val => {});

      comp.setAnswer = (val) => {
        comp.setAnswerOriginal(val);
        const idx = this.selectedValues.findIndex(v => v.value === subInstance.parentValue);
        if (idx >= 0) {
          this.selectedValues[idx].subAnswer = val;
          // this.selectedValues[idx].subAnswer.instance.setAnswer(val);
          // this.selectedValues[idx].subAnswer.value = val; // stocker la valeur
          this.setAnswer(this.buildAnswerObject());
        }
      };

      // Restaurer la valeur précédente si elle existe
      const idx = this.selectedValues.findIndex(v => v.value === subInstance.parentValue);
      if (idx >= 0 && this.selectedValues[idx].subAnswer?.value != null) {
        comp.setAnswerOriginal(this.selectedValues[idx].subAnswer.value);
      }
    }
  });
}
}

// import Question from './Question.js';
// import ExclusiveRule from '../rules/ExclusiveRule.js';
// import QuestionContent from './QuestionContent.js';
// import SubQuestionRender from '../render/SubQuestionRender.js';
// import { showToast } from '../utils/toast.js';

// const subQuestionRender = new SubQuestionRender();

// export default class MultipleChoiceQuestion extends Question {
//   constructor(step, store, renderer, allSteps, sources = {}) {
//     super(step, store, renderer);
//     this.selectedValues = [];
//     this.allSteps = allSteps;
//     this.sources = sources;
//     this.subQuestionInstances = {}; // stocke uniquement les instances pour le rendu
//     this.container = null;
//   }

//   init() {
//     const answer = this.getAnswer();
//     this.selectedValues = answer?.value || [];

//     // Réinitialiser les sous-questions
//     this.subQuestionInstances = {};

//     // Créer les sous-questions pour les options cochées
//     this.selectedValues.forEach(sel => {
//       const option = this.step.options.find(o => o.value === sel.value);
//       if (option?.requiresSubQst?.value) this.initSubQuestion(option, sel);
//     });

//     this.step.component = this;
//   }

//   initSubQuestion(option, selectedObj) {
//     const subStep = this.allSteps.find(s => s.id === option.requiresSubQst.subQst_id);
//     if (!subStep) return;
  
//     const tableData = subStep.table ? { [subStep.table]: this.sources[subStep.table] || [] } : {};
//     const instance = new QuestionContent(subStep, this.allSteps, tableData, 'sub-question-template');
//     instance.initComponent();
  
//     // Restaurer la valeur depuis selectedValues ou depuis store principal
//     let existingValue = selectedObj.subAnswer;
//     if (!existingValue) {
//       const storeAnswer = this.store.get(this.step.id);
//       existingValue = storeAnswer?.subAnswer?.[subStep.id] || null;
//     }
  
//     if (existingValue) {
//       instance.component?.setAnswer(existingValue); // passer tout l'objet
//       selectedObj.subAnswer = existingValue; // stocker tout l'objet
//     }
  
//     this.subQuestionInstances[option.value] = instance;
//   }
  
//   buildAnswerObject() {
//     return {
//       questionId: this.step.id,
//       type: 'multiple_choice',
//       value: this.selectedValues.map(v => {
//         const obj = { codeItem: v.codeItem, value: v.value };
//         if (v.precision) obj.precision = v.precision;

//         // Stocker uniquement la valeur de la sous-question
//         if (v.subAnswer && this.subQuestionInstances[v.value]) {
//           const subValue = this.subQuestionInstances[v.value].component?.buildAnswerObject?.() || null;
//           console.log('sub answer mulri',subValue)
//           obj.subAnswer = subValue ? { [this.subQuestionInstances[v.value].step.id]: subValue } : null;
//         }
//         return obj;
//       })
//     };
//   }

//   isValid() {
//     if (!this.selectedValues.length) {
//       showToast('Veuillez sélectionner au moins une option');
//       return false;
//     }

//     for (const selected of this.selectedValues) {
//       const optionMeta = this.step.options.find(o => o.value === selected.value);

//       if (optionMeta?.requiresPrecision && (!selected.precision || !selected.precision.trim())) {
//         showToast(`Veuillez préciser votre réponse pour "${optionMeta.label}"`);
//         return false;
//       }

//       if (this.subQuestionInstances[selected.value]?.component) {
//         const subComp = this.subQuestionInstances[selected.value].component;
//         if (!subComp.buildAnswerObject()?.value || !subComp.isValid?.()) {
//           showToast(`Veuillez répondre à la sous-question pour "${optionMeta.label}"`);
//           return false;
//         }
//       }
//     }

//     return true;
//   }

//   handleOption(option, checked, precision = null) {
//     let selectedObj = this.selectedValues.find(v => v.value === option.value);

//     if (checked) {
//       const obj = { value: option.value, codeItem: option.codeItem };
//       if (precision?.trim()) obj.precision = precision.trim();

//       if (selectedObj) Object.assign(selectedObj, obj);
//       else {
//         selectedObj = obj;
//         this.selectedValues.push(selectedObj);
//       }

//       // Initialiser la sous-question si nécessaire
//       if (option.requiresSubQst?.value && !this.subQuestionInstances[option.value]) {
//         this.initSubQuestion(option, selectedObj);
//       }
//     } else {
//       // Retirer sélection + sous-question
//       this.selectedValues = this.selectedValues.filter(v => v.value !== option.value);
//       delete this.subQuestionInstances[option.value];
//     }

//     // Appliquer règle exclusive
//     const backupSub = Object.fromEntries(this.selectedValues.map(v => [v.value, v.subAnswer]));
//     this.selectedValues = ExclusiveRule.apply(this.step.options, this.selectedValues, option.value)
//       .map(v => ({ ...v, subAnswer: backupSub[v.value] }));

//     this.setAnswer(this.buildAnswerObject());
//     this.renderer.syncCheckboxes(this.step.id, this.selectedValues.map(v => v.value));

//     if (this.container) this.renderSubQuestions(this.container);
//   }

//   onChange(option) {
//     return (checked, precision = null) => this.handleOption(option, checked, precision);
//   }

//   render() {
//     this.init();
//     this.container = this.renderer.renderMultipleChoice(this.step, this.selectedValues, option => this.onChange(option));
//     this.renderSubQuestions(this.container);
//     return this.container;
//   }

//   renderSubQuestions(container) {
//     Object.entries(this.subQuestionInstances).forEach(([parentValue, subInstance]) => {
//       let subContainer = container.querySelector(`.sub-question-container[data-parent="${parentValue}"]`);
//       if (!subContainer) {
//         subContainer = subQuestionRender.renderSubQuestion(subInstance);
//         subContainer.dataset.parent = parentValue;
//         container.appendChild(subContainer);
//       }

//       const comp = subInstance.component;

//       if (!comp.setAnswerOriginal) {
//         comp.setAnswerOriginal = comp.setAnswer?.bind(comp) || (val => {});

//         comp.setAnswer = val => {
//           comp.setAnswerOriginal(val);
//           console.log('val',val)
//           const selectedObj = this.selectedValues.find(v => v.value === parentValue);
//           if (selectedObj) {
//             console.log("selectedObj",selectedObj)
//             selectedObj.subAnswer =  val ; 
//             this.setAnswer(this.buildAnswerObject());
//           }
//         };
//       }
//     });
//   }
// }
