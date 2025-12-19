import Question from './Question.js';
import ExclusiveRule from '../rules/ExclusiveRule.js';
import QuestionContent from './QuestionContent.js';
import SubQuestionRender from '../render/SubQuestionRender.js';

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

  // init() {
  //   const answer = this.getAnswer();
  //   // Normalisation : récupérer uniquement value array
  //   this.selectedValues = answer?.value || [];
  //   this.step.component = this;
  // }
  init() {
    const answer = this.getAnswer();
    this.selectedValues = answer?.value || [];

    // Pré-créer les sous-questions pour toutes les options cochables qui ont une sous-question
    this.step.options.forEach(option => {
      const isSelected = this.selectedValues.find(v => v.value === option.value);
      if (option.requiresSubQst?.value ) {
        const subStep = this.allSteps.find(s => s.id === option.requiresSubQst.subQst_id);
        if (subStep) {
          const instance = new QuestionContent(subStep, this.allSteps, {}, 'sub-question-template');
          instance.initComponent();
        //  instance.parentValue = option.value;
        //  this.subQuestionInstances[option.value] = instance;

          // Si option déjà sélectionnée dans le store, garder la valeur, sinon mettre à null
          // const selectedObj = this.selectedValues.find(v => v.value === option.value);
          // if (selectedObj) {
          //   selectedObj.subAnswer = { instance };
          // } else {
          //   // Option pas encore sélectionnée → créer subAnswer vide
          //   this.selectedValues.push({
          //     codeItem: option.codeItem,
          //     value: option.value,
          //     subAnswer: { instance }
          //   });
          // }
        }
      }
    });

    this.step.component = this;
  }
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

        if (v.subAnswer?.instance) {
          const subAnswerObj = v.subAnswer.instance.getAnswer();
          obj.subAnswer = {
            [v.subAnswer.instance.step.id]: subAnswerObj || { questionId: v.subAnswer.instance.step.id, type: v.subAnswer.instance.step.type, value: null }
          };
        }

        return obj;
      })
    };
  }

  // Gérer la sélection d’une option
  handleOption(option, checked, precision = null) {
    const idx = this.selectedValues.findIndex(v => v.value === option.value);

    if (checked) {
      const obj = {
        value: option.value,
        // label: option.label,
        codeItem: option.codeItem
      };
      if (precision?.trim()) obj.precision = precision.trim();

      // Ajouter ou mettre à jour
      if (idx >= 0) {
        this.selectedValues[idx] = { ...this.selectedValues[idx], ...obj };
      } else {
                this.selectedValues.push(obj);

      //  this.selectedValues.push({ ...obj, subAnswer: { instance } });
      }

      // Créer sous-question si nécessaire
      if (option.requiresSubQst?.value) {
        const subStep = this.allSteps.find(s => s.id === option.requiresSubQst.subQst_id);
        if (subStep && !this.subQuestionInstances[option.value]) {
          const tableData = subStep.table ? { [subStep.table]: this.sources[subStep.table] || [] } : {}; console.log('tableData', tableData);
          const instance = new QuestionContent(subStep, this.allSteps, tableData, 'sub-question-template');
          instance.initComponent();
          instance.parentValue = option.value;
          this.subQuestionInstances[option.value] = instance;

          // Créer subAnswer uniquement si sous-question
        const selectedObj = this.selectedValues.find(v => v.value === option.value);
          selectedObj.subAnswer = { instance };
        }
      }
    } else {
      // Décocher → supprimer option et sous-question
      this.selectedValues = this.selectedValues.filter(v => v.value !== option.value);
      delete this.subQuestionInstances[option.value];
    }

    // Appliquer règle exclusive tout en conservant subAnswer
    const subAnswersBackup = this.selectedValues.reduce((acc, v) => {
      if (v.subAnswer) acc[v.value] = v.subAnswer;
      return acc;
    }, {});

    this.selectedValues = ExclusiveRule.apply(this.step.options, this.selectedValues, option.value);

    // Restaurer les subAnswer
    this.selectedValues = this.selectedValues.map(v => {
      if (v.subAnswer) return { ...v, subAnswer: v.subAnswer ?? subAnswersBackup[v.value] };
      return v; // options sans sous-question restent sans subAnswer
    });


  //  this.setAnswer([...this.selectedValues]);
  this.setAnswer(this.buildAnswerObject());

    this.renderer.syncCheckboxes(this.step.id, this.selectedValues.map(v => v.value));

    if (this.container) this.renderSubQuestions(this.container);
  }

  onChange(option) {
    return (checked, precision = null) => this.handleOption(option, checked, precision);
  }

  render() {
    this.init();

    this.container = this.renderer.renderMultipleChoice(
      this.step,
      this.selectedValues,
      (option) => this.onChange(option)
    );

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
        comp.setAnswerOriginal = comp.setAnswer?.bind(comp) || ((val) => { });

        // Redéfinir setAnswer pour mettre à jour selectedValues
        comp.setAnswer = (val) => {
          const idx = this.selectedValues.findIndex(v => v.value === subInstance.parentValue);
          if (idx >= 0) {
            //this.selectedValues[idx].subAnswer = { id: subInstance.step.id, value: val };
            this.selectedValues[idx].subAnswer.instance.setAnswer(val);
           // this.setAnswer([...this.selectedValues]);
           this.setAnswer(this.buildAnswerObject());

          }
          comp.setAnswerOriginal(val);
        };

        // Pré-remplir si valeur existante
        const idx = this.selectedValues.findIndex(v => v.value === subInstance.parentValue);
        if (idx >= 0 && this.selectedValues[idx].subAnswer?.value != null) {
          comp.setAnswerOriginal(this.selectedValues[idx].subAnswer.value);
        }
      }
    });
  }
}
