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

  // Réinitialiser les instances existantes
  this.subQuestionInstances = {};

  // Pré-créer les sous-questions pour toutes les options cochées avec sous-question
  this.step.options.forEach(option => {
    if (!option.requiresSubQst?.value) return;

    const selectedObj = this.selectedValues.find(v => v.value === option.value);
    if (!selectedObj) return;

    const subStep = this.allSteps.find(s => s.id === option.requiresSubQst.subQst_id);
    if (!subStep) return;

    // Créer l'instance de sous-question
    const tableData = subStep.table ? { [subStep.table]: this.sources[subStep.table] || [] } : {};
    const instance = new QuestionContent(subStep, this.allSteps, tableData, 'sub-question-template');
    instance.initComponent();

    // Restaurer la valeur précédente de la sous-question si elle existe
    if (selectedObj.subAnswer?.instance?.component?.getAnswer) {
      instance.component?.setAnswer(selectedObj.subAnswer.instance.getAnswer());
    }

    // Mettre à jour selectedValues et subQuestionInstances
    selectedObj.subAnswer = { instance, value: selectedObj.subAnswer?.value || null };
    this.subQuestionInstances[option.value] = instance;
  });

  this.step.component = this;
}

  // init() {
  //   const answer = this.getAnswer();
  //   this.selectedValues = answer?.value || [];

  //   // Pré-créer les sous-questions pour toutes les options cochables qui ont une sous-question
  //   this.step.options.forEach(option => {
  //     if (option.requiresSubQst?.value) {
  //       const subStep = this.allSteps.find(s => s.id === option.requiresSubQst.subQst_id);
  //       if (subStep) {
  //         const selectedObj = this.selectedValues.find(v => v.value === option.value);
  //         if (selectedObj?.subAnswer) {
  //           const instance = new QuestionContent(subStep, this.allSteps, {}, 'sub-question-template');
  //           instance.initComponent();
  //           if (selectedObj?.subAnswer?.instance?.getAnswer) {
  //             instance.component?.setAnswer(selectedObj.subAnswer.instance.getAnswer());
  //           }
  //          // Mettre à jour subAnswer et subQuestionInstances
  //       selectedObj.subAnswer.instance = instance;
  //       this.subQuestionInstances[option.value] = instance;

  //           // instance.component?.setAnswer(selectedObj.subAnswer.instance.getAnswer());
  //           // this.subQuestionInstances[option.value] = instance;
  //           // selectedObj.subAnswer.instance = instance;
  //         }
  //       }
  //     }
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

        if (v.subAnswer?.instance?.component) {
          const subAnswerObj = v.subAnswer.instance.component.buildAnswerObject?.();
          obj.subAnswer = {
            [v.subAnswer.instance.step.id]: subAnswerObj || { questionId: v.subAnswer.instance.step.id, type: v.subAnswer.instance.step.type, value: null }
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
          selectedObj.subAnswer = { instance };
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
          this.selectedValues[idx].subAnswer.instance.setAnswer(val);
          this.selectedValues[idx].subAnswer.value = val; // stocker la valeur
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
//   renderSubQuestions(container) {
//     Object.values(this.subQuestionInstances).forEach(subInstance => {
//       let subContainer = container.querySelector(`.sub-question-container[data-parent="${subInstance.parentValue}"]`);

//       if (!subContainer) {
//         subContainer = subQuestionRender.renderSubQuestion(subInstance);
//         subContainer.dataset.parent = subInstance.parentValue;
//         container.appendChild(subContainer);
//       }

//       const comp = subInstance.component;
// console.log("comp",comp)
//       if (!comp.setAnswerOriginal) {
//         comp.setAnswerOriginal = comp.setAnswer?.bind(comp) || (val => { });
//         comp.setAnswer = (val) => {
//           comp.setAnswerOriginal(val);
//           const idx = this.selectedValues.findIndex(v => v.value === subInstance.parentValue);
//           if (idx >= 0) {
//             this.selectedValues[idx].subAnswer.instance.setAnswer(val);
//             this.selectedValues[idx].subAnswer.value = val; // <-- ajouté
//             console.log(" this.selectedValues[idx].subAnswer.value = val;", this.selectedValues[idx].subAnswer)
//             this.setAnswer(this.buildAnswerObject());
            
//           }
//         };

//         const idx = this.selectedValues.findIndex(v => v.value === subInstance.parentValue);
//         if (idx >= 0 && this.selectedValues[idx].subAnswer?.value != null) {
//           comp.setAnswerOriginal(this.selectedValues[idx].subAnswer.value);
//         }
//       }
//     });
//   }
}
