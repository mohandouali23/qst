import Question from './Question.js';
import ExclusiveRule from '../rules/ExclusiveRule.js';
import QuestionContent from './QuestionContent.js';
import SubQuestionRender from '../render/SubQuestionRender.js';

const subQuestionRender = new SubQuestionRender();

export default class MultipleChoiceQuestion extends Question {
  constructor(step, store, renderer, allSteps) {
    super(step, store, renderer);
    this.selectedValues = [];
    this.allSteps = allSteps;
    this.subQuestionInstances = {};
    this.container = null;
  }

  init() {
    this.selectedValues = this.getAnswer() || [];
    this.step.component = this;
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
      }

      // Créer sous-question si nécessaire
      if (option.requiresSubQst?.value) {
        const subStep = this.allSteps.find(s => s.id === option.requiresSubQst.subQst_id);
        if (subStep && !this.subQuestionInstances[option.value]) {
          const instance = new QuestionContent(subStep, this.allSteps, {}, 'sub-question-template');
          instance.initComponent();
          instance.parentValue = option.value;
          this.subQuestionInstances[option.value] = instance;

          // Créer subAnswer uniquement si sous-question
          this.selectedValues.find(v => v.value === option.value).subAnswer = { id: subStep.id, value: null };
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


    this.setAnswer([...this.selectedValues]);
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
        comp.setAnswerOriginal = comp.setAnswer?.bind(comp) || ((val) => {});

        // Redéfinir setAnswer pour mettre à jour selectedValues
        comp.setAnswer = (val) => {
          const idx = this.selectedValues.findIndex(v => v.value === subInstance.parentValue);
          if (idx >= 0) {
            this.selectedValues[idx].subAnswer = { id: subInstance.step.id, value: val };
            this.setAnswer([...this.selectedValues]);
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
